/**
 * 首屏入场动画：深色幕布 + 品牌字，CSS 动画结束后自动上移消失。
 * 纯 CSS 实现（不依赖 JS 水合），所以网络慢时也不会卡在黑屏；
 * 系统开启「减少动态效果」时直接不显示。
 */
export function IntroCurtain() {
  return (
    <div id="intro-curtain" className="intro-curtain" aria-hidden>
      <div className="intro-content">
        <p className="intro-brand text-[15px] tracking-[0.5em] text-paper">lvyt.top</p>
        <span className="intro-line mx-auto mt-6 block h-px w-16 bg-[#c8a97e]/70" />
        <p className="intro-caption mt-6 text-[10px] tracking-[0.42em] text-[#6a6a70]">
          PERSONAL PHOTOGRAPHY
        </p>
      </div>
    </div>
  );
}
