import { startSiteLoading } from '../../app/utils/site-loading-bootstrap.js'

export function deferPageStyles (markup: string) {
  // Protect opaque text blocks; only actual external stylesheet tags change.
  return markup.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>|<link\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi, (tag) => {
    if (!/^<link\b/i.test(tag) || /\sdata-site-loading-media\s*=/i.test(tag)) { return tag }
    const rel = tag.match(/\srel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    if ((rel?.[1] ?? rel?.[2] ?? rel?.[3])?.toLowerCase() !== 'stylesheet' || !/\shref\s*=/i.test(tag)) { return tag }
    const mediaAttribute = /\smedia\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
    const match = tag.match(mediaAttribute)
    const media = (match?.[1] ?? match?.[2] ?? match?.[3] ?? 'all').replace(/"/g, '&quot;')
    const deferred = tag.replace(mediaAttribute, '').replace(/\s*\/?>$/, ` media="print" data-site-loading-media="${media}">`)
    return `${deferred}<noscript>${tag}</noscript>`
  })
}

const styles = `
.site-loading,.site-loading *{-webkit-user-select:none;user-select:none}
.site-loading{position:fixed;inset:0;z-index:10000;width:100%;height:100%;max-width:none;max-height:none;box-sizing:border-box;margin:0;padding:32px;border:0;color:#fff;background:#000;font:14px/1.5 Georgia,'Songti SC',SimSun,serif;transition:opacity 300ms ease;overscroll-behavior:none;overflow:hidden}
.site-loading[open]{display:grid;place-items:center}.site-loading::backdrop{background:#000;transition:opacity 300ms ease}
.site-loading.is-leaving,.site-loading.is-leaving::backdrop{opacity:0}
.site-loading__content{width:min(100%,340px);text-align:center}
.site-loading__progress{text-align:left}
.site-loading__readout{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:11px;letter-spacing:.1em}
.site-loading__value{font:24px/1 Georgia,serif;font-variant-numeric:tabular-nums;letter-spacing:0;white-space:nowrap}
.site-loading__value small{margin-left:5px;font-size:11px}
.site-loading__track{box-sizing:border-box;height:6px;margin-top:14px;padding:1px;border:1px solid #fff;background:#000}
.site-loading__track span{display:block;width:100%;height:100%;background:#fff;transform:scaleX(0);transform-origin:left}
@media(max-width:480px){.site-loading__content{width:min(100%,280px)}}
@media(prefers-reduced-motion:reduce){.site-loading,.site-loading::backdrop{transition:none}}
`

export function renderSiteLoading (path: string) {
  const english = /^\/en-us(?:\/|$)/.test(path)
  const traditional = /^\/zh-hk(?:\/|$)/.test(path)
  const label = english ? 'Page loading progress' : traditional ? '頁面載入進度' : '页面加载进度'
  const loading = english ? 'Loading' : traditional ? '正在載入' : '正在载入'
  const home = /^\/(?:en-us|zh-hk|zh-cn)?\/?$/.test(path)
  return {
    head: `<style id="site-loading-style">${styles}</style><script id="site-loading-bootstrap">(${startSiteLoading.toString()})()</script><noscript><style>#site-loading{display:none!important}</style></noscript>`,
    bodyPrepend: `<dialog id="site-loading" class="site-loading" lang="${english ? 'en' : traditional ? 'zh-Hant' : 'zh-Hans'}" open tabindex="-1" aria-label="${label}" data-home-scene="${home}">
      <div class="site-loading__content">
        <div class="site-loading__progress">
          <div class="site-loading__readout" aria-hidden="true"><span>${loading}</span><span class="site-loading__value"><span data-loading-number>00</span><small>%</small></span></div>
          <div class="site-loading__track" role="progressbar" aria-label="${label}" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"><span data-loading-fill></span></div>
        </div>
      </div>
    </dialog>`,
    bodyAppend: '<script>window.__everglowLoading?.documentReady()</script>',
  }
}
