import { useEffect, useState } from "react";

/** First visit only. Later page changes keep the site on screen. */
const BOOT_CSS = `
#boot-splash{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#F4F8FF;color:#5b6b86;font-family:"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif}
.boot-mark{width:4.5rem;height:4.5rem;overflow:visible}
.boot-eyes{transform-box:fill-box;transform-origin:center;animation:boot-look 2.4s ease-in-out infinite}
.boot-blink{transform-box:fill-box;transform-origin:center;animation:boot-blink 2.4s ease-in-out infinite}
.boot-line{margin-top:0.9rem;font-size:0.875rem;font-weight:500;letter-spacing:0.01em}
html[data-boot="en"] .boot-zh{display:none}
html:not([data-boot="en"]) .boot-en{display:none}
.boot-bar{position:absolute;right:0;bottom:0;left:0;height:2px;overflow:hidden;background:rgba(0,168,197,0.2)}
.boot-bar>span{display:block;height:100%;width:33%;background:#00a8c5;animation:boot-slide 900ms ease-in-out infinite}
@keyframes boot-look{0%,18%{transform:translate(0,0)}32%,48%{transform:translate(-16%,0)}62%,78%{transform:translate(16%,0)}100%{transform:translate(0,0)}}
@keyframes boot-blink{0%,42%,48%,100%{transform:scaleY(1)}44%,46%{transform:scaleY(0.08)}}
@keyframes boot-slide{0%{transform:translateX(-120%)}100%{transform:translateX(420%)}}
@media (prefers-reduced-motion:reduce){
  .boot-eyes,.boot-blink,.boot-bar>span{animation:none}
}
`;

function BootSplashView() {
  return (
    <div id="boot-splash" role="status">
      <style>{BOOT_CSS}</style>
      <svg className="boot-mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#1557C4" />
        <rect x="6" y="8" width="11" height="16" rx="3.5" fill="#ffffff" />
        <rect x="15" y="8" width="11" height="16" rx="3.5" fill="#00a8c5" />
        <g className="boot-eyes">
          <g className="boot-blink">
            <circle cx="11.5" cy="13.5" r="1.7" fill="#1557C4" />
            <circle cx="20.5" cy="13.5" r="1.7" fill="#ffffff" />
          </g>
        </g>
      </svg>
      <p className="boot-line boot-zh">搵寬頻唔使四圍問</p>
      <p className="boot-line boot-en">Compare Hong Kong broadband in one place</p>
      <div className="boot-bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

export function BootSplash() {
  const [boot, setBoot] = useState(true);

  useEffect(() => {
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBoot(false));
    });
    return () => cancelAnimationFrame(outer);
  }, []);

  if (!boot) return null;
  return <BootSplashView />;
}