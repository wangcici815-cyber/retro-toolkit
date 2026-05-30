/* ai-assist.js — AI-powered parameter assistant via Cloudflare Pages Function
   The DeepSeek API key lives in Pages Secrets, never in the browser.
   Set DEEPSEEK_API_KEY in Pages Dashboard → Settings → Environment Variables. */
  (function() {
    'use strict';

    /* ── CONFIG ── Pages Function 路由（和站点同域名，无需完整 URL） */
    const WORKER_URL = '/api/chat';
    /* ─────────────────────────────────────────────────────────────── */

    const MODEL = 'deepseek-v4-flash';

    window.initAIAssist = function(config) {
      const root = document.getElementById(config.containerId);
      if (!root) return;

      root.innerHTML = buildUI(config);

      const promptInput = root.querySelector('.ai-prompt');
      const applyBtn = root.querySelector('.ai-apply');
      const statusEl = root.querySelector('.ai-status');
      const suggestions = root.querySelectorAll('.ai-suggestion');

      // Suggestion chips
      suggestions.forEach(function(chip) {
        chip.addEventListener('click', function() {
          promptInput.value = chip.textContent.trim();
          promptInput.focus();
        });
      });

      // Apply
      applyBtn.addEventListener('click', function() {
        const text = promptInput.value.trim();
        if (!text) {
          showStatus('Describe what you want.', 'amber');
          return;
        }
        callDeepSeek(text, config, showStatus, applyBtn);
      });

      // Enter key
      promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') applyBtn.click();
      });

      function showStatus(msg, color) {
        statusEl.style.display = 'block';
        statusEl.innerHTML = '<span class="prompt">&gt;</span> <span style="color:var(--' + color + ')">' + escapeHtml(msg) + '</span>';
      }
    };

    /* ── UI builder ── */

    function buildUI(config) {
      const chips = (config.suggestions || []).map(function(s) {
        return '<button class="ai-suggestion" type="button">' + escapeHtml(s) + '</button>';
      }).join('');

      return (
        '<div class="ai-header">' +
          '<span class="section-label" style="margin:0;">AI Assist <span class="text-amber">✦</span></span>' +
        '</div>' +
        '<p class="ai-desc">Describe the ' + escapeHtml(config.toolLabel) + ' you want. AI adjusts all parameters for you.</p>' +
        '<div class="ai-input-row">' +
          '<input type="text" class="ai-prompt" placeholder="' + escapeHtml(config.placeholder || 'e.g. worn-out cassette from a 1989 boombox') + '" />' +
          '<button class="ai-apply" type="button">✦ Apply</button>' +
        '</div>' +
        (chips ? '<div class="ai-suggestions">' + chips + '</div>' : '') +
        '<div class="ai-status" style="display:none;"></div>'
      );
    }

    /* ── Prompt builder ── */

    function buildSystemPrompt(config) {
      var lines = [
        'You are a retro audio expert assistant. Map the user\'s description to parameters for a ' + config.toolLabel + ' tool.',
        'Return ONLY a valid JSON object with no markdown formatting, no code fences, no extra text.',
        '',
        'Numeric parameters (0-100 scale unless noted):'
      ];

      (config.paramGroups || []).forEach(function(group) {
        (group.params || []).forEach(function(p) {
          lines.push('- ' + p.id + ': ' + p.label + ' (' + (p.min || 0) + '-' + (p.max || 100) + ')');
        });
      });

      if (config.effects && config.effects.length) {
        lines.push('', 'Boolean toggles (true/false):');
        config.effects.forEach(function(e) {
          lines.push('- ' + e.id + ': ' + e.label);
        });
      }

      if (config.examples && config.examples.length) {
        lines.push('', 'Examples:');
        config.examples.forEach(function(ex) {
          lines.push('User: "' + ex.input + '"');
          lines.push('Response: ' + JSON.stringify(ex.output));
          lines.push('');
        });
      }

      return lines.join('\n');
    }

    /* ── API call ── */

    async function callDeepSeek(userText, config, showStatus, applyBtn) {
      showStatus('Asking AI...', 'amber');
      applyBtn.disabled = true;
      applyBtn.textContent = '...';

      try {
        var systemPrompt = buildSystemPrompt(config);

        var response = await fetch(WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userText }
            ],
            temperature: 0.1,
            max_tokens: 600
          })
        });

        if (!response.ok) {
          var errText = await response.text();
          var msg = 'API error';
          try {
            var errJson = JSON.parse(errText);
            msg = errJson.error && errJson.error.message ? errJson.error.message : errText;
          } catch (_) {
            msg = errText || 'HTTP ' + response.status;
          }
          throw new Error(msg);
        }

        var data = await response.json();
        var content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';

        var cleaned = content.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
        var params;
        try {
          params = JSON.parse(cleaned);
        } catch (e) {
          console.error('AI raw response:', content);
          throw new Error('AI response was not valid JSON. Try rephrasing your description.');
        }

        if (config.onApply) config.onApply(params);

        var explanation = params.explanation || 'Parameters applied!';
        showStatus(explanation, 'green');

      } catch (err) {
        showStatus(err.message, 'red');
      } finally {
        applyBtn.disabled = false;
        applyBtn.textContent = '✦ Apply';
      }
    }

    /* ── Utility ── */

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

  })();
