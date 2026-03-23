import React, { useRef, useEffect, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import '../index.css';

/** Kích thước 1 trang + chế độ portrait (1 trang/màn hình) cho mobile */
function useMagazineBookSize() {
  const [state, setState] = useState(() => ({
    width: 636,
    height: 450,
    usePortrait: false,
  }));

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isSmall = vw < 1024; // Update breakpoint to 1024px to cover 800-1000px range
      if (isSmall) {
        // Leave more room for shadows and safe area
        const sidePad = vw < 400 ? 20 : 32; 
        const pageW = Math.min(636, Math.max(280, vw - sidePad));
        // Tránh trang quá thấp (tỉ lệ 636:450 trên màn hẹp → ~200px, cắt hết chữ):
        // dùng chiều cao tối thiểu theo viewport, vẫn giới hạn max để không vỡ layout.
        const aspectH = Math.round((pageW * 450) / 636);
        const minH = Math.min(580, Math.max(320, Math.round(vh * 0.6)));
        const pageH = Math.max(aspectH, minH);
        setState({ width: pageW, height: pageH, usePortrait: true });
      } else {
        setState({ width: 636, height: 450, usePortrait: false });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return state;
}

const MagazineContext = React.createContext({ isMobile: false });

const Page = React.forwardRef((props, ref) => {
  const { isMobile } = React.useContext(MagazineContext);
  const { hideHeader = false } = props;

  return (
    <div
      className={`magazine-page-inner border-r border-zinc-800/60 shadow-magazine-inner relative h-full w-full overflow-hidden ${
        isMobile ? 'transform-gpu' : ''
      }`}
      ref={ref}
    >
      {/* Lớp trang trí: gradient góc + họa tiết chấm */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_-20%,rgba(185,28,28,0.14),transparent_45%),radial-gradient(80%_60%_at_0%_100%,rgba(0,0,0,0.35),transparent_50%)]"
        aria-hidden
      />
      {!isMobile && (
        <div
          className="magazine-page-texture pointer-events-none absolute inset-0 opacity-[0.045]"
          aria-hidden
        />
      )}
      <div className="magazine-page-shell relative flex h-full min-h-0 flex-col pl-3 pr-3 pt-4 sm:pl-5 sm:pr-6 sm:pt-7 md:pl-7 md:pr-9 md:pt-9">
        {/* Thanh nhấn đỏ + nhãn - ẩn nếu hideHeader=true hoặc PDF page không có số */}
        {!hideHeader && (
          <div className="mb-2 sm:mb-4 flex shrink-0 items-center gap-2 pl-1 sm:gap-3">
            <div className="h-8 sm:h-12 w-1 shrink-0 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-900/80 shadow-[0_0_12px_rgba(220,38,38,0.35)]" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-outfit text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.42em] text-red-500/90">
                Kinh tế chính trị
              </span>
              <span className="font-outfit text-[7px] sm:text-[8px] uppercase tracking-[0.28em] text-zinc-600">
                Mác — Lênin · Hồ sơ NEP
              </span>
            </div>
          </div>
        )}

        {/* Nội dung — tự động thu nhỏ trên mobile để không cần cuộn */}
        <div
          className="magazine-page-body min-h-0 flex-1 overflow-hidden font-inter text-[12.5px] leading-[1.65] text-zinc-300 sm:text-[15px] sm:leading-[1.75] md:text-[17px] [&_h2]:font-outfit [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white [&_h3]:font-outfit [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[0.12em] [&_strong]:font-semibold [&_strong]:text-zinc-100"
        >
          {/* Khung nội dung nhẹ */}
          <div className="magazine-prose h-full flex flex-col justify-center rounded-sm border border-white/[0.06] bg-zinc-900/20 px-3 py-2.5 shadow-inner shadow-black/20 ring-1 ring-white/[0.03] sm:block sm:h-auto sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div>{props.children}</div>
          </div>
        </div>

        {/* Footer trong luồng — PDF/html2canvas luôn thấy đủ */}
        {props.number && (
          <footer className="magazine-page-footer mt-2 sm:mt-3 flex shrink-0 flex-row items-end justify-between gap-3 border-t border-red-950/50 bg-gradient-to-t from-zinc-950/90 to-transparent pt-2.5 sm:pt-3 text-[9px] sm:text-[10px] text-zinc-500 md:text-[11px]">
            <div className="flex items-baseline gap-2 font-outfit">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-zinc-600">Trang</span>
              <span className="text-base sm:text-lg font-bold tabular-nums leading-none text-red-500/95">{props.number}</span>
            </div>
            <a
              href="https://mln122-gr6.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="magazine-footer-link break-all text-right font-inter text-[9.5px] sm:text-[10px] font-normal normal-case tracking-normal text-red-400/95 [overflow-wrap:anywhere] transition-colors hover:text-red-300 sm:max-w-[70%] md:text-[11px]"
            >
              mln122-gr6.onrender.com
            </a>
          </footer>
        )}
      </div>
    </div>
  );
});

const ImagePage = React.forwardRef((props, ref) => {
  const { isMobile } = React.useContext(MagazineContext);
  
  return (
    <div className={`bg-zinc-950 overflow-hidden relative w-full h-full magazine-image-frame ${isMobile ? 'transform-gpu' : ''}`} ref={ref}>
      <img
        src={props.image}
        alt={props.caption || 'Magazine Page'}
        className="w-full h-full object-cover absolute inset-0 scale-[1.01]"
        loading="lazy"
        decoding="async"
      />
      {!isMobile && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50 pointer-events-none" />
          <div className="absolute inset-0 bg-black/15 mix-blend-multiply pointer-events-none" />
        </>
      )}
      {props.caption && (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-6 pt-16 sm:pt-20 pointer-events-none">
          <p className="text-gray-300 text-xs sm:text-sm font-sans italic border-l-2 border-red-600 pl-3 drop-shadow-md">
            {props.caption}
          </p>
        </div>
      )}
    </div>
  );
});

const CoverPage = React.forwardRef((props, ref) => {
  const { isMobile } = React.useContext(MagazineContext);
  return (
    <div className={`bg-black overflow-hidden relative w-full h-full ${isMobile ? 'transform-gpu' : ''}`} ref={ref}>
      <img src={props.image} alt="Cover Page" className="w-full h-full object-cover absolute inset-0" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 flex flex-col justify-end p-8 md:p-12 relative z-10 pointer-events-none">
        {!isMobile && <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(220,38,38,0.12),transparent)] pointer-events-none" />}
        <div className="pointer-events-auto">
          {props.children}
        </div>
      </div>
    </div>
  );
});

const Magazine = () => {
  const printRef = useRef();
  const flipBookRef = useRef(null);
  const lastFlipPageRef = useRef(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { width, height, usePortrait } = useMagazineBookSize();
  const TOTAL_PAGES = 36;

  const handleDownloadPdf = () => {
    setIsGenerating(true);

    // Khớp A4 ngang: ~1123×794px (cùng tỉ lệ với trang flipbook 636×450)
    const opt = {
      margin: 0,
      filename: 'Tap-Chi-NEP-1921.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#171717',
        // Không giới hạn theo viewport — tránh cắt đáy trang khi clone off-screen
        windowWidth: 1123,
        windowHeight: 4096,
        scrollY: 0,
        scrollX: 0,
        x: 0,
        y: 0
      },
      jsPDF: { unit: 'px', format: [1123, 794], orientation: 'landscape', compress: true }
    };

    const applyPdfHardFix = (pages) => {
      pages.forEach((page) => {
        if (!page.classList.contains('pdf-page--text')) return;

        page.style.overflow = 'hidden';
        page.style.height = '794px';
        page.style.maxHeight = '794px';

        const inner = page.querySelector('.magazine-page-inner');
        if (inner) {
          inner.style.overflow = 'hidden';
          inner.style.height = '100%';
          inner.style.maxHeight = '100%';
          inner.style.position = 'relative';
        }

        const shell = page.querySelector('.magazine-page-shell');
        if (shell) {
          shell.style.height = '100%';
          shell.style.maxHeight = '100%';
          shell.style.display = 'flex';
          shell.style.flexDirection = 'column';
          shell.style.paddingTop = '22px';
          shell.style.paddingLeft = '32px';
          shell.style.paddingRight = '32px';
          shell.style.paddingBottom = '126px';
          shell.style.boxSizing = 'border-box';
          shell.style.position = 'relative';
        }

        const body = page.querySelector('.magazine-page-body');
        if (body) {
          body.style.flex = '1 1 auto';
          body.style.minHeight = '0';
          body.style.overflow = 'hidden';
        }

        const prose = page.querySelector('.magazine-prose');
        if (prose) {
          prose.style.fontSize = '32px';
          prose.style.lineHeight = '1.52';
          prose.style.padding = '16px 20px';
        }

        page.querySelectorAll('.magazine-prose h2').forEach((el) => {
          el.style.fontSize = '2.75rem';
          el.style.lineHeight = '1.1';
          el.style.marginBottom = '0.85rem';
        });

        page.querySelectorAll('.magazine-prose h3').forEach((el) => {
          el.style.fontSize = '1.95rem';
          el.style.lineHeight = '1.18';
          el.style.marginBottom = '0.75rem';
        });

        page.querySelectorAll('.magazine-prose p').forEach((el) => {
          el.style.fontSize = '1em';
          el.style.lineHeight = 'inherit';
          el.style.marginBottom = '0.65rem';
        });

        const hasCreditsHeading = Array.from(
          page.querySelectorAll('.magazine-prose h2, .magazine-prose h3')
        ).some((el) => el.textContent?.toLowerCase().includes('ban biên tập'));
        if (hasCreditsHeading) {
          if (shell) {
            shell.style.paddingTop = '28px';
            shell.style.paddingBottom = '28px';
          }
          if (body) {
            body.style.display = 'flex';
            body.style.alignItems = 'center';
            body.style.justifyContent = 'center';
            body.style.overflow = 'visible';
          }
          if (prose) {
            prose.style.fontSize = '24px';
            prose.style.lineHeight = '1.44';
            prose.style.padding = '12px 18px';
          }
          page.querySelectorAll('.magazine-prose h3').forEach((el) => {
            el.style.fontSize = '1.58rem';
            el.style.lineHeight = '1.2';
            el.style.marginBottom = '0.4rem';
          });
          page.querySelectorAll('.magazine-prose p').forEach((el) => {
            el.style.fontSize = '0.74em';
            el.style.lineHeight = '1.42';
          });

          const creditsWrapper = page.querySelector('.magazine-credits-content');
          if (creditsWrapper) {
            creditsWrapper.style.maxWidth = '620px';
            creditsWrapper.style.margin = '0 auto';
          }

          const creditsBadge = page.querySelector('.magazine-credits-badge');
          if (creditsBadge) {
            creditsBadge.style.width = '74px';
            creditsBadge.style.height = '74px';
            creditsBadge.style.marginBottom = '18px';
            creditsBadge.style.marginTop = '2px';
            creditsBadge.style.borderRadius = '18px';
            creditsBadge.style.display = 'block';
            creditsBadge.style.position = 'relative';
            creditsBadge.style.padding = '0';
            creditsBadge.style.fontSize = '1.95rem';
            creditsBadge.style.lineHeight = '1';
          }
          const creditsBadgeText = page.querySelector('.magazine-credits-badge-text');
          if (creditsBadgeText) {
            creditsBadgeText.style.display = 'block';
            creditsBadgeText.style.position = 'absolute';
            creditsBadgeText.style.left = '50%';
            creditsBadgeText.style.top = '50%';
            creditsBadgeText.style.transform = 'translate(-50%, -50%)';
            creditsBadgeText.style.lineHeight = '1';
            creditsBadgeText.style.margin = '0';
            creditsBadgeText.style.padding = '0';
            creditsBadgeText.style.whiteSpace = 'nowrap';
            creditsBadgeText.style.textAlign = 'center';
          }
        }

        // Kết luận (inside back cover) cần nhỏ hơn để giữ nhịp thị giác ở trang cuối.
        const hasConclusionHeading = Array.from(
          page.querySelectorAll('.magazine-prose h2, .magazine-prose h3')
        ).some((el) => el.textContent?.toLowerCase().includes('kết luận'));
        if (hasConclusionHeading) {
          if (prose) {
            prose.style.fontSize = '26px';
            prose.style.lineHeight = '1.48';
            prose.style.padding = '14px 18px';
          }
          page.querySelectorAll('.magazine-prose h2, .magazine-prose h3').forEach((el) => {
            el.style.fontSize = '1.5rem';
            el.style.lineHeight = '1.2';
          });
          page.querySelectorAll('.magazine-prose p').forEach((el) => {
            el.style.fontSize = '0.82em';
            el.style.lineHeight = '1.5';
          });
        }

        const footer = page.querySelector('.magazine-page-footer');
        if (footer) {
          footer.style.position = 'absolute';
          footer.style.left = '32px';
          footer.style.right = '32px';
          footer.style.bottom = '10px';
          footer.style.marginTop = '0';
          footer.style.paddingTop = '8px';
          footer.style.paddingBottom = '6px';
          footer.style.display = 'flex';
          footer.style.flexDirection = 'row';
          footer.style.alignItems = 'flex-end';
          footer.style.justifyContent = 'space-between';
          footer.style.gap = '16px';
          footer.style.background = 'rgba(9,9,11,0.96)';
          footer.style.borderTop = '1px solid rgba(127,29,29,0.55)';
          footer.style.fontSize = '14px';
          footer.style.lineHeight = '1.35';
          footer.style.zIndex = '30';
        }

        const pageNo = page.querySelector('.magazine-page-footer .tabular-nums');
        if (pageNo) {
          pageNo.style.fontSize = '1.45rem';
          pageNo.style.lineHeight = '1';
        }

        const link = page.querySelector('.magazine-footer-link');
        if (link) {
          link.style.fontSize = '12px';
          link.style.lineHeight = '1.35';
          link.style.maxWidth = 'none';
          link.style.wordBreak = 'break-all';
          link.style.overflowWrap = 'anywhere';
          link.style.textAlign = 'right';
          link.style.textDecoration = 'underline';
        }
      });
    };

    // Process pages sequentially to avoid canvas limits
    import('html2pdf.js').then((html2pdf) => {
      setTimeout(async () => {
        try {
          const pages = Array.from(printRef.current.querySelectorAll('.pdf-page'));
          applyPdfHardFix(pages);
          const pdfWorker = html2pdf.default().set(opt).from(pages[0]).toPdf();

          for (let i = 1; i < pages.length; i++) {
            await pdfWorker.get('pdf').then(pdf => {
              pdf.addPage();
              return pdfWorker.from(pages[i]).toContainer().toCanvas().toPdf();
            });
          }

          await pdfWorker.save();
          setIsGenerating(false);
        } catch (error) {
          console.error('PDF Generation Error:', error);
          alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
          setIsGenerating(false);
        }
      }, 500);
    });
  };

  return (
    <MagazineContext.Provider value={{ isMobile: usePortrait }}>
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-0 sm:p-4 lg:p-8 font-sans overflow-x-hidden">

      <div className="mb-6 text-center">
        <h2 className="text-red-600 font-bold tracking-[0.2em] uppercase text-sm mb-2">Hồ Sơ Đặc Biệt: 36 Trang</h2>
        <p className="text-gray-500 text-xs mb-4">Sử dụng chuột kéo hoặc click vào góc trang để lật mở</p>
        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded text-sm tracking-wider transition-colors disabled:opacity-50 inline-flex items-center justify-center mx-auto gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tạo PDF...
            </>
          ) : 'Tải xuống PDF'}
        </button>
      </div>

      <div className="w-full max-w-full overflow-hidden flex justify-center py-4 px-2 sm:px-0">
        <HTMLFlipBook
          ref={flipBookRef}
          width={width}
          height={height}
          size="stretch"
          minWidth={usePortrait ? width : 420}
          maxWidth={780}
          minHeight={usePortrait ? height : 315}
          maxHeight={550}
          maxShadowOpacity={usePortrait ? 0.3 : 0.5}
          showCover={true}
          mobileScrollSupport={false}
          swipeDistance={usePortrait ? 50 : 30}
          className={`magazine-flipbook mx-auto ${usePortrait ? 'mobile-flipbook' : ''}`}
          useMouseEvents={true}
          usePortrait={usePortrait}
          startPage={0}
          onFlip={(e) => {
            const nextPage = e?.data ?? 0;
            const prevPage = lastFlipPageRef.current;

            // Guard against accidental wrap-around from last page to first page when users spam flip/scroll.
            const jumpedFromTailToHead =
              prevPage >= Math.floor(TOTAL_PAGES * 0.7) && nextPage <= 1;
            const suspiciousBigBackwardJump =
              prevPage - nextPage > Math.floor(TOTAL_PAGES * 0.45);
            if (jumpedFromTailToHead || suspiciousBigBackwardJump) {
              requestAnimationFrame(() => {
                flipBookRef.current?.pageFlip()?.turnToPage(TOTAL_PAGES - 1);
              });
              lastFlipPageRef.current = TOTAL_PAGES - 1;
              return;
            }

            lastFlipPageRef.current = nextPage;
          }}
        >
        {/* Page 1: Cover */}
        <div className="bg-black overflow-hidden relative w-full h-full">
          <img src="/images/nep-cover.png" alt="Cover Page" className="w-full h-full object-cover absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10">
            <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 border-l-[6px] sm:border-l-[10px] border-red-600 pl-4 sm:pl-8">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase leading-none drop-shadow-2xl flex items-baseline gap-2 sm:gap-4">
                NEP <span className="text-red-600">1921</span>
              </h1>
              <p className="text-white font-bold tracking-[0.2em] sm:tracking-[0.4em] uppercase text-sm sm:text-lg md:text-xl drop-shadow-lg mt-2 sm:mt-4 opacity-90">
                Sự lùi bước vĩ đại của Lênin
              </p>
            </div>
          </div>
        </div>

        {/* Page 2: Inside Cover (Credits) */}
        <Page hideHeader={true}>
          <div className="magazine-credits-content flex flex-col h-full justify-center items-center text-center px-2">
            <div className="magazine-credits-badge relative w-20 h-20 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-zinc-900/80 p-0 text-2xl font-black mb-5 text-red-400 font-outfit shadow-lg shadow-red-950/40 ring-1 ring-red-500/20">
              <span className="magazine-credits-badge-text absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 leading-none">G6</span>
            </div>
            <h3 className="font-outfit uppercase tracking-[0.28em] text-base font-bold text-white mb-1">Ban biên tập</h3>
            <p className="text-sm text-zinc-500 mb-6 font-normal">Chuyên đề Kinh tế Chính trị Mác — Lênin</p>

            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-4 mb-5 shadow-inner shadow-black/40 ring-1 ring-white/5 transition-transform hover:scale-[1.02]">
              <img src="/images/QR.png" alt="QR truy cập dự án" className="w-28 h-28 md:w-32 md:h-32 object-contain mx-auto" />
            </div>

            <p className="text-red-400 font-semibold tracking-[0.2em] uppercase text-[10px] mb-1.5">Quét mã để truy cập</p>
            <a
              href="https://mln122-gr6.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 text-xs hover:text-red-300 transition-colors underline-offset-4 hover:underline"
            >
              mln122-gr6.onrender.com
            </a>

            <p className="text-[11px] text-zinc-600 mt-10 tracking-wide">Xuất bản · Tháng 3 / 2026</p>
          </div>
        </Page>

        {/* Page 3: Lời tựa / Bối cảnh */}
        <Page number={1}>
          <h2 className="text-3xl font-bold text-white mb-8 font-sans leading-tight">
            Khi màn đêm bao phủ <span className="text-red-500">Đế Quốc Nga</span>
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-300">
            Để hiểu được sự vĩ đại của Chính sách Kinh tế mới (NEP), chúng ta phải nhìn lại điểm xuất phát tăm tối của nước Nga vào đầu thế kỷ 20.
          </p>
          <p className="leading-relaxed text-gray-400">
            Chiến tranh thế giới thứ nhất đã vắt kiệt sinh lực của một đế chế nông nghiệp lạc hậu. Hàng triệu thanh niên nông dân bị ném vào các chiến hào đẫm máu. Ở hậu phương, lạm phát phi mã, công nghiệp đình đốn và nạn đói bắt đầu lan rộng khắp các đô thị lớn. Nước Nga Sa Hoàng đang đứng trên bờ vực của sự sụp đổ hoàn toàn.
          </p>
          <div className="mt-8 w-12 h-1 bg-red-600"></div>
        </Page>

        {/* Page 4: Image WW1 */}
        <ImagePage
          image="/images/ww1-russia.png"
          caption="Nước Nga kiệt quệ trong những chiến hào lầy lội của Thế chiến I."
        />

        {/* Page 5: Text */}
        <Page number={2}>
          <h3 className="text-lg sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 uppercase tracking-wider">
            Cách mạng Tháng Mười & Ánh sáng hy vọng
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Ngày 7/11/1917, Cách mạng Tháng Mười nổ ra, đánh dấu lần đầu tiên trong lịch sử, giai cấp công - nông vươn lên nắm chính quyền.
          </p>
          <p className="mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed text-gray-400">
            Những người Bôn-sê-vích do Lênin lãnh đạo đã mang lại hy vọng cho hàng triệu người nghèo khổ. Tuy nhiên, chính quyền non trẻ ngay lập tức phải đối mặt với sự can thiệp vũ trang của 14 nước đế quốc và cuộc nội chiến khốc liệt chống lại lực lượng Bạch Vệ.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400 font-bold">
            Hòa bình vẫn chưa thể trở lại với nước Nga Xô Viết.
          </p>
        </Page>

        {/* Page 6: Image October Rev */}
        <ImagePage
          image="/images/october-revolution.png"
          caption="Cách mạng Tháng Mười - Sự kiện rung chuyển thế giới năm 1917."
        />

        {/* Page 7: Text */}
        <Page number={3}>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">
            Chính sách "Cộng sản thời chiến"
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Trong tình thế "ngàn cân treo sợi tóc", để tập trung mọi nguồn lực cho mặt trận, chính quyền Xô Viết buộc phải thi hành chính sách "Cộng sản thời chiến".
          </p>
          <p className="mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Đặc trưng cốt lõi của nó là chế độ <strong>trưng thu lương thực thừa</strong>: nông dân phải giao nộp toàn bộ số lương thực dư thừa cho nhà nước với giá rẻ mạt để nuôi sống Hồng quân và công nhân thành thị. Tư do buôn bán bị cấm đoán hoàn toàn.
          </p>
        </Page>

        {/* Page 8: Image War Communism */}
        <ImagePage
          image="/images/war-communism.png"
          caption="Hồng quân thực hiện chế độ trưng thu lương thực tại các làng mạc."
        />

        {/* Page 9: Text */}
        <Page number={4}>
          <h3 className="text-lg sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 uppercase tracking-wider">
            Nền kinh tế bên bờ vực thẳm
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Đến năm 1920, dù đã chiến thắng trong nội chiến, nhưng "Cộng sản thời chiến" đã triệt tiêu hoàn toàn động lực sản xuất của nông dân. Họ chỉ trồng đủ ăn, nhiều vùng còn cố tình phá hoại mùa màng.
          </p>
          <p className="mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Sản lượng công nghiệp chỉ bằng 1/7, nông nghiệp giảm một nửa so với năm 1913. Giao thông vận tải tê liệt. Thiếu nhiên liệu và nguyên liệu, hàng loạt nhà máy lớn phải đóng cửa. Công nhân bỏ về nông thôn tìm cái ăn.
          </p>
        </Page>

        {/* Page 10: Image Crisis */}
        <ImagePage
          image="/images/nep-crisis.png"
          caption="Các nhà máy lạnh giá, đình đốn và cái đói hoành hành khắp nước Nga (1920)."
        />

        {/* Page 11: Text */}
        <Page number={5}>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">
            Tiếng chuông cảnh tỉnh Kronstadt
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Sự bất mãn lên đến đỉnh điểm vào mùa xuân năm 1921. Khắp nơi nông dân nổi dậy. Đỉnh điểm là cuộc nổi dậy của các thủy thủ tại căn cứ hải quân Kronstadt - lực lượng từng là nòng cốt trung kiên nhất của Cách mạng Tháng Mười.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Dù cuộc nổi dậy bị dập tắt, nhưng nó là tiếng chuông báo động đỏ đối với Lênin. Ông nhận ra rằng chính quyền Xô Viết đang đứng trước nguy cơ sụp đổ từ bên trong, lớn hơn bất kỳ sự can thiệp ngoại bang nào.
          </p>
        </Page>

        {/* Page 12: Image Kronstadt */}
        <ImagePage
          image="/images/kronstadt.png"
          caption="Sự kiện Kronstadt: Khi những người trung kiên nhất cũng phản kháng cái đói."
        />

        {/* Page 13: Text */}
        <Page number={6}>
          <h3 className="text-lg sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 uppercase tracking-wider">
            Đại hội X & Bước ngoặt lịch sử
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Tháng 3 năm 1921, Đại hội lần thứ X của Đảng Cộng sản Nga (Bôn-sê-vích) được triệu tập. Trong bầu không khí vô cùng căng thẳng, Lênin đã đưa ra một đề xuất táo bạo làm chấn động toàn bộ đại hội.
          </p>
          <p className="mb-4 sm:mb-6 text-xs sm:text-base leading-relaxed text-gray-300 italic border-l-2 border-red-600 pl-4">
            "Chúng ta đã tiến quá xa vào con đường quốc hữu hóa... Đó có phải là một sai lầm? Chắc chắn là như vậy. Chúng ta phải lùi lại để tạo đà tiến xa hơn."
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">Đó là lúc NEP chính thức được thông qua.</p>
        </Page>

        {/* Page 14: Image Lenin Speech */}
        <ImagePage
          image="/images/lenin-speech.png"
          caption="V.I. Lênin đọc báo cáo lịch sử tại Đại hội X (tháng 3/1921)."
        />

        {/* Page 15: Text */}
        <Page number={7}>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">
            Khai sinh Chính sách Kinh tế Mới
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Chính sách Kinh tế Mới (NEP) đánh dấu sự thay đổi tư duy triệt để. Từ chỗ cố gắng xóa bỏ ngay lập tức kinh tế hàng hóa, Lênin chủ trương sử dụng chính thị trường, tiền tệ và quan hệ hàng hóa làm "đòn bẩy" để xây dựng chủ nghĩa xã hội.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Đây là sự vận dụng sáng tạo chủ nghĩa Mác vào điều kiện cụ thể của một nước Nga nông nghiệp, tiểu nông, chưa trải qua giai đoạn phát triển cao của chủ nghĩa tư bản.
          </p>
        </Page>

        {/* Page 16: Image NEP Historical */}
        <ImagePage
          image="/images/nep-historical.png"
          caption="Chợ búa hoạt động trở lại, hàng hóa lưu thông nhộn nhịp sau khi NEP ra đời."
        />

        {/* Page 17: Text */}
        <Page number={8}>
          <h3 className="text-lg sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 uppercase tracking-wider">
            Thuế lương thực: Cởi trói cho nông dân
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Nền tảng quan trọng nhất của NEP là thay thế "trưng thu lương thực" bằng "thuế lương thực".
          </p>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Mức thuế này được ấn định cố định và thấp hơn nhiều so với mức trưng thu trước đây. Quan trọng nhất, sau khi nộp đủ thuế, nông dân được quyền tự do mang số nông sản dư thừa ra thị trường buôn bán.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400 font-bold">
            Chỉ một chính sách nhỏ này đã lập tức thổi bùng sinh khí cho toàn bộ vùng nông thôn rộng lớn.
          </p>
        </Page>

        {/* Page 18: Image Prodnalog */}
        <ImagePage
          image="/images/prodnalog.png"
          caption="Nông dân yên tâm nộp thuế lương thực, phần còn lại thuộc quyền sở hữu của họ."
        />

        {/* Page 19: Text */}
        <Page number={9}>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">
            Sự trỗi dậy của các "Nepmen"
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Cùng với nông nghiệp, thương nghiệp tự do được khôi phục. Nhà nước cho phép tư nhân mở các cửa hàng, xí nghiệp nhỏ (dưới 20 công nhân).
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Tầng lớp thương nhân tư bản tư nhân xuất hiện trở lại, được gọi là các <strong>Nepmen</strong>. Dù gây ra một số chênh lệch giàu nghèo, nhưng họ đóng vai trò quan trọng trong việc lưu thông hàng hóa, giải quyết tình trạng khan hiếm nhu yếu phẩm tại các đô thị.
          </p>
        </Page>

        {/* Page 20: Image Nepmen */}
        <ImagePage
          image="/images/nepmen.png"
          caption="Các 'Nepmen' - tầng lớp thương nhân tư nhân thịnh vượng tại các đô thị thập niên 1920."
        />

        {/* Page 21: Text */}
        <Page number={10}>
          <h3 className="text-lg sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 uppercase tracking-wider">
            Chủ nghĩa tư bản nhà nước
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Một bước đi táo bạo khác của Lênin là áp dụng "Chủ nghĩa tư bản nhà nước". Nhà nước Xô Viết cho phép tư bản nước ngoài thuê mướn xí nghiệp, nhượng tô khai thác tài nguyên.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Đối với các xí nghiệp quốc doanh, chế độ bao cấp bị xóa bỏ. Các nhà máy phải tự hạch toán kinh tế, lấy thu bù chi và đảm bảo có lãi. Nhà nước chỉ nắm giữ chặt chẽ các "huyết mạch": ngân hàng, đường sắt, ngoại thương và công nghiệp nặng.
          </p>
        </Page>

        {/* Page 22: Image State Capitalism */}
        <ImagePage
          image="/images/state-capitalism.png"
          caption="Chủ nghĩa tư bản nhà nước: Sự hợp tác giữa nhà nước vô sản và kỹ thuật tư bản."
        />

        {/* Page 23: Text */}
        <Page number={11}>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">
            Khủng hoảng "Cái Kéo" (1923)
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            NEP không phải là một con đường trải hoa hồng. Năm 1923, nền kinh tế gặp hiện tượng "Khủng hoảng cái kéo" (Scissors Crisis).
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Giá nông sản giảm mạnh (do phục hồi nhanh), trong khi giá hàng công nghiệp tăng vọt (do công nghiệp phục hồi chậm hơn). Khoảng cách giá cả mở rộng như hình một cái kéo. Nông dân bắt đầu từ chối bán lúa mì để mua hàng công nghiệp đắt đỏ. Chính phủ đã phải can thiệp điều chỉnh giá để cứu vãn thị trường.
          </p>
        </Page>

        {/* Page 24: Image Scissors Crisis */}
        <ImagePage
          image="/images/scissors-crisis.png"
          caption="Biểu tượng 'Khủng hoảng Cái Kéo': Sự chênh lệch giữa giá nông sản và công nghiệp."
        />

        {/* Page 25: Text */}
        <Page number={12}>
          <h3 className="text-lg sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 uppercase tracking-wider">
            Lenin qua đời: Tổn thất vô giá
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Tháng 1 năm 1924, V.I. Lênin qua đời sau một thời gian dài lâm bệnh. Đây là một tổn thất không thể bù đắp đối với Đảng Bôn-sê-vích và nước Nga Xô Viết.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Dù mất đi người kiến trúc sư trưởng, NEP vẫn tiếp tục được duy trì và phát huy hiệu quả mạnh mẽ trong những năm tiếp theo, đưa nước Nga dần thoát khỏi vũng lầy nghèo đói và khôi phục hoàn toàn tiềm lực.
          </p>
        </Page>

        {/* Page 26: Image Lenin Funeral */}
        <ImagePage
          image="/images/lenin-funeral.png"
          caption="Quần chúng xót thương đưa tang Lênin giữa mùa đông lạnh giá năm 1924."
        />

        {/* Page 27: Text */}
        <Page number={13}>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">
            Công nghiệp phục hồi & Kế hoạch GOELRO
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Đến năm 1926, kinh tế Xô Viết đã khôi phục về mức trước Thế chiến thứ nhất. Đặc biệt, Kế hoạch điện khí hóa toàn quốc (GOELRO) do Lênin khởi xướng đã mang lại những thành tựu rực rỡ.
          </p>
          <p className="mb-3 sm:mb-4 text-xs sm:text-base leading-relaxed text-gray-300 italic border-l-2 border-red-600 pl-4">
            "Chủ nghĩa cộng sản là chính quyền Xô Viết cộng với điện khí hóa toàn quốc."
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Các nhà máy thủy điện lớn được xây dựng, tạo nền tảng vững chắc cho công cuộc công nghiệp hóa vĩ đại sau này.
          </p>
        </Page>

        {/* Page 28: Image Industry */}
        <ImagePage
          image="/images/nep-industry.png"
          caption="Kế hoạch GOELRO: Điện khí hóa toàn quốc và công cuộc kiến thiết vĩ đại."
        />

        {/* Page 29: Text */}
        <Page number={14}>
          <h3 className="text-lg sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 uppercase tracking-wider">
            Sự phân hóa nông thôn và Phú nông
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Cùng với sự sung túc trở lại của nông thôn, sự phân hóa giai cấp cũng gia tăng. Một bộ phận nông dân làm ăn giỏi trở nên giàu có, thuê mướn nhân công - họ được gọi là các <strong>Kulak (Phú nông)</strong>.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Điều này gây ra những cuộc tranh luận gay gắt trong nội bộ Đảng Cộng sản. Liệu việc để cho một bộ phận nhỏ làm giàu có đe dọa đến nền tảng của chủ nghĩa xã hội? Cuộc chiến ý thức hệ về số phận của các Kulak bắt đầu manh nha.
          </p>
        </Page>

        {/* Page 30: Image Kulaks */}
        <ImagePage
          image="/images/kulaks.png"
          caption="Các nông dân khá giả (Kulak) tại các vùng nông thôn nước Nga trong thời kỳ NEP."
        />

        {/* Page 31: Text */}
        <Page number={15}>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">
            Kết thúc NEP: Tiến lên Công nghiệp hóa
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Vào cuối những năm 1920, I.V. Stalin củng cố quyền lực. Đối mặt với nguy cơ chiến tranh và yêu cầu phải hiện đại hóa thần tốc, giới lãnh đạo Xô Viết quyết định NEP đã hoàn thành sứ mệnh lịch sử.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Năm 1928, NEP bị chấm dứt. Liên Xô chuyển sang mô hình kinh tế kế hoạch hóa tập trung, tập thể hóa nông nghiệp cưỡng bức và các Kế hoạch 5 năm nhằm phát triển công nghiệp nặng với tốc độ chưa từng có trong lịch sử nhân loại.
          </p>
        </Page>

        {/* Page 32: Image End of NEP */}
        <ImagePage
          image="/images/end-of-nep.png"
          caption="Stalin tuyên bố kết thúc NEP, mở đầu kỷ nguyên Kế hoạch hóa tập trung và Công nghiệp hóa."
        />

        {/* Page 33: Text */}
        <Page number={16}>
          <h3 className="text-xl sm:text-3xl font-bold text-red-500 mb-4 sm:mb-6 font-sans">
            Di sản của NEP trong kinh tế hiện đại
          </h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-400">
            Dù chỉ tồn tại ngắn ngủi (1921-1928), nhưng NEP là một di sản lý luận kinh tế chính trị vô giá. Nó chứng minh rằng: <strong>Không thể tiến thẳng lên chủ nghĩa xã hội bằng mệnh lệnh hành chính</strong> ở một nước kinh tế kém phát triển.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-gray-400">
            Tư tưởng của Lênin về việc sử dụng thị trường có sự quản lý của nhà nước vô sản đã trở thành kim chỉ nam cho công cuộc Đổi mới tại Việt Nam (1986).
          </p>
        </Page>

        {/* Page 34: Image Modern Legacy */}
        <ImagePage
          image="/images/modern-legacy.png"
          caption="Thành tựu của kinh tế thị trường định hướng XHCN - Sự kế thừa rực rỡ từ tư tưởng NEP."
        />

        {/* Page 35: Inside Back Cover (Blank/Epilogue) */}
        <Page>
          <div className="flex flex-col h-full justify-center items-center text-center px-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-600/80 to-transparent mb-8" />
            <h3 className="font-outfit uppercase tracking-[0.35em] text-sm font-bold text-red-400/90 mb-5">Kết luận</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm text-balance">
              Sự linh hoạt, thực tế và lòng dũng cảm tự phê bình của V.I. Lênin trong việc đề ra NEP mãi mãi là bài học kinh điển của môn Kinh tế Chính trị Mác — Lênin.
            </p>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-600/80 to-transparent mt-8" />
          </div>
        </Page>

        {/* Page 36: Back Cover */}
        <div className="bg-black relative w-full h-full overflow-hidden">
          <img src="/images/nep-cover.png" alt="Back Cover" className="w-full h-full object-cover absolute inset-0 opacity-50 uppercase" />
          <div className="absolute inset-0 flex flex-col justify-center items-center z-10">
            <div className="bg-black/60 backdrop-blur-md p-8 py-12 border border-white/10 flex flex-col items-center max-w-lg w-full text-center">
              {/* <h2 className="text-5xl font-black text-red-600 mb-4 tracking-[0.3em] drop-shadow-lg">HẾT</h2>
              <div className="w-24 h-px bg-white/20 mb-6"></div> */}
              <p className="text-gray-400 text-xs uppercase tracking-[0.4em] mb-3">Một sản phẩm của</p>
              <p className="text-white font-bold text-3xl mb-6 tracking-wider">Nhóm 6</p>

              <div className="bg-transparent p-2 rounded-xl shadow-2xl mb-4 transform transition-transform hover:scale-105 border-4 border-red-600/20">
                <img src="/images/QR.png" alt="QR Code" className="w-28 h-28 object-contain" />
              </div>

              <p className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs mb-2">Quét mã để truy cập</p>
              <a href="https://mln122-gr6.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 text-xs hover:text-white font-medium tracking-wide transition-colors mb-6 bg-zinc-900/80 px-4 py-1.5 rounded-full border border-zinc-800">
                mln122-gr6.onrender.com
              </a>

              {/* <p className="text-gray-400 text-xs max-w-xs leading-relaxed text-center opacity-80 italic">
                Mô phỏng tạp chí tương tác 36 trang phục vụ bộ môn Kinh tế Chính trị Mác - Lênin.
              </p> */}
            </div>
          </div>
        </div>
      </HTMLFlipBook>
    </div>

      {/* PDF Container - Hidden but accessible */}
      <div
        style={{
          position: 'absolute',
          left: '-5000px',
          top: 0,
          width: '1123px',
          visibility: 'visible',
          zIndex: -1000
        }}
      >
    <div ref={printRef} className="pdf-print-root bg-neutral-900 text-[#d4d4d8] block w-[1123px]">

      {/* Page 1: Cover */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900">
        <div className="bg-black overflow-hidden relative w-full h-full">
          <img src="/images/nep-cover.png" alt="Cover Page" className="w-full h-full object-cover absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10">
            <div className="absolute bottom-10 left-10 border-l-[10px] border-red-600 pl-8">
              <h1 className="text-7xl md:text-8xl font-black text-white uppercase leading-none drop-shadow-2xl flex items-baseline gap-4">
                NEP <span className="text-red-600">1921</span>
              </h1>
              <p className="text-white font-bold tracking-[0.4em] uppercase text-xl drop-shadow-lg mt-4 opacity-90">
                Sự lùi bước vĩ đại của Lênin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page 2: Inside Cover (Credits) */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page hideHeader={true}>
        <div className="magazine-credits-content flex flex-col h-full justify-center items-center text-center px-4">
          <div className="magazine-credits-badge relative w-20 h-20 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-zinc-900/80 p-0 text-2xl font-black mb-6 text-red-400 font-outfit shadow-lg shadow-red-950/40 ring-1 ring-red-500/20">
            <span className="magazine-credits-badge-text absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 leading-none">G6</span>
          </div>
          <h3 className="uppercase tracking-[0.3em] text-lg font-bold text-white mb-2">Ban Biên Tập</h3>
          <p className="text-sm text-gray-400 mb-8 font-light">Chuyên đề Kinh tế Chính trị Mác - Lênin</p>

          <div className="bg-transparent p-2 rounded-lg shadow-xl mb-4 transform transition-transform hover:scale-105 inline-block">
            <img src="/images/QR.png" alt="QR Code" className="w-32 h-32 object-contain" />
          </div>

          <p className="text-red-500 font-bold tracking-widest uppercase text-xs mb-2">Quét mã để truy cập</p>
          <a href="https://mln122-gr6.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-xs hover:text-white transition-colors">
            mln122-gr6.onrender.com
          </a>

          <p className="text-xs text-zinc-600 mt-8">Xuất bản: Tháng 3 / 2026</p>
        </div>
      </Page></div>

      {/* Page 3: Lời tựa / Bối cảnh */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={1}>
        <h2 className="text-3xl font-bold text-white mb-6 font-sans leading-tight">
          Khi màn đêm bao phủ <span className="text-red-500">Đế Quốc Nga</span>
        </h2>
        <p className="mb-4 leading-relaxed text-gray-300">
          Để hiểu được sự vĩ đại của Chính sách Kinh tế mới (NEP), chúng ta phải nhìn lại điểm xuất phát tăm tối của nước Nga vào đầu thế kỷ 20.
        </p>
        <p className="leading-relaxed text-gray-400">
          Chiến tranh thế giới thứ nhất đã vắt kiệt sinh lực của một đế chế nông nghiệp lạc hậu. Hàng triệu thanh niên nông dân bị ném vào các chiến hào đẫm máu. Ở hậu phương, lạm phát phi mã, công nghiệp đình đốn và nạn đói bắt đầu lan rộng khắp các đô thị lớn. Nước Nga Sa Hoàng đang đứng trên bờ vực của sự sụp đổ hoàn toàn.
        </p>
        <div className="mt-8 w-12 h-1 bg-red-600"></div>
      </Page></div>

      {/* Page 4: Image WW1 */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/ww1-russia.png"
        caption="Nước Nga kiệt quệ trong những chiến hào lầy lội của Thế chiến I."
      /></div>

      {/* Page 5: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={2}>
        <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
          Cách mạng Tháng Mười & Ánh sáng hy vọng
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Ngày 7/11/1917, Cách mạng Tháng Mười nổ ra, đánh dấu lần đầu tiên trong lịch sử, giai cấp công - nông vươn lên nắm chính quyền.
        </p>
        <p className="mb-6 leading-relaxed text-gray-400">
          Những người Bôn-sê-vích do Lênin lãnh đạo đã mang lại hy vọng cho hàng triệu người nghèo khổ. Tuy nhiên, chính quyền non trẻ ngay lập tức phải đối mặt với sự can thiệp vũ trang của 14 nước đế quốc và cuộc nội chiến khốc liệt chống lại lực lượng Bạch Vệ.
        </p>
        <p className="leading-relaxed text-gray-400 font-bold">
          Hòa bình vẫn chưa thể trở lại với nước Nga Xô Viết.
        </p>
      </Page></div>

      {/* Page 6: Image October Rev */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/october-revolution.png"
        caption="Cách mạng Tháng Mười - Sự kiện rung chuyển thế giới năm 1917."
      /></div>

      {/* Page 7: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={3}>
        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
          Chính sách "Cộng sản thời chiến"
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Trong tình thế "ngàn cân treo sợi tóc", để tập trung mọi nguồn lực cho mặt trận, chính quyền Xô Viết buộc phải thi hành chính sách "Cộng sản thời chiến".
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Đặc trưng cốt lõi của nó là chế độ <strong>trưng thu lương thực thừa</strong>: nông dân phải giao nộp toàn bộ số lương thực dư thừa cho nhà nước với giá rẻ mạt để nuôi sống Hồng quân và công nhân thành thị. Tư do buôn bán bị cấm đoán hoàn toàn.
        </p>
      </Page></div>

      {/* Page 8: Image War Communism */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/war-communism.png"
        caption="Hồng quân thực hiện chế độ trưng thu lương thực tại các làng mạc."
      /></div>

      {/* Page 9: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={4}>
        <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
          Nền kinh tế bên bờ vực thẳm
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Đến năm 1920, dù đã chiến thắng trong nội chiến, nhưng "Cộng sản thời chiến" đã triệt tiêu hoàn toàn động lực sản xuất của nông dân. Họ chỉ trồng đủ ăn, nhiều vùng còn cố tình phá hoại mùa màng.
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Sản lượng công nghiệp chỉ bằng 1/7, nông nghiệp giảm một nửa so với năm 1913. Giao thông vận tải tê liệt. Thiếu nhiên liệu và nguyên liệu, hàng loạt nhà máy lớn phải đóng cửa. Công nhân bỏ về nông thôn tìm cái ăn.
        </p>
      </Page></div>

      {/* Page 10: Image Crisis */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/nep-crisis.png"
        caption="Các nhà máy lạnh giá, đình đốn và cái đói hoành hành khắp nước Nga (1920)."
      /></div>

      {/* Page 11: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={5}>
        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
          Tiếng chuông cảnh tỉnh Kronstadt
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Sự bất mãn lên đến đỉnh điểm vào mùa xuân năm 1921. Khắp nơi nông dân nổi dậy. Đỉnh điểm là cuộc nổi dậy của các thủy thủ tại căn cứ hải quân Kronstadt - lực lượng từng là nòng cốt trung kiên nhất của Cách mạng Tháng Mười.
        </p>
        <p className="leading-relaxed text-gray-400">
          Dù cuộc nổi dậy bị dập tắt, nhưng nó là tiếng chuông báo động đỏ đối với Lênin. Ông nhận ra rằng chính quyền Xô Viết đang đứng trước nguy cơ sụp đổ từ bên trong, lớn hơn bất kỳ sự can thiệp ngoại bang nào.
        </p>
      </Page></div>

      {/* Page 12: Image Kronstadt */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/kronstadt.png"
        caption="Sự kiện Kronstadt: Khi những người trung kiên nhất cũng phản kháng cái đói."
      /></div>

      {/* Page 13: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={6}>
        <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
          Đại hội X & Bước ngoặt lịch sử
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Tháng 3 năm 1921, Đại hội lần thứ X của Đảng Cộng sản Nga (Bôn-sê-vích) được triệu tập. Trong bầu không khí vô cùng căng thẳng, Lênin đã đưa ra một đề xuất táo bạo làm chấn động toàn bộ đại hội.
        </p>
        <p className="mb-6 leading-relaxed text-gray-300 italic border-l-2 border-red-600 pl-4">
          "Chúng ta đã tiến quá xa vào con đường quốc hữu hóa... Đó có phải là một sai lầm? Chắc chắn là như vậy. Chúng ta phải lùi lại để tạo đà tiến xa hơn."
        </p>
        <p className="leading-relaxed text-gray-400">Đó là lúc NEP chính thức được thông qua.</p>
      </Page></div>

      {/* Page 14: Image Lenin Speech */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/lenin-speech.png"
        caption="V.I. Lênin đọc báo cáo lịch sử tại Đại hội X (tháng 3/1921)."
      /></div>

      {/* Page 15: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={7}>
        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
          Khai sinh Chính sách Kinh tế Mới
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Chính sách Kinh tế Mới (NEP) đánh dấu sự thay đổi tư duy triệt để. Từ chỗ cố gắng xóa bỏ ngay lập tức kinh tế hàng hóa, Lênin chủ trương sử dụng chính thị trường, tiền tệ và quan hệ hàng hóa làm "đòn bẩy" để xây dựng chủ nghĩa xã hội.
        </p>
        <p className="leading-relaxed text-gray-400">
          Đây là sự vận dụng sáng tạo chủ nghĩa Mác vào điều kiện cụ thể của một nước Nga nông nghiệp, tiểu nông, chưa trải qua giai đoạn phát triển cao của chủ nghĩa tư bản.
        </p>
      </Page></div>

      {/* Page 16: Image NEP Historical */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/nep-historical.png"
        caption="Chợ búa hoạt động trở lại, hàng hóa lưu thông nhộn nhịp sau khi NEP ra đời."
      /></div>

      {/* Page 17: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={8}>
        <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
          Thuế lương thực: Cởi trói cho nông dân
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Nền tảng quan trọng nhất của NEP là thay thế "trưng thu lương thực" bằng "thuế lương thực".
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Mức thuế này được ấn định cố định và thấp hơn nhiều so với mức trưng thu trước đây. Quan trọng nhất, sau khi nộp đủ thuế, nông dân được quyền tự do mang số nông sản dư thừa ra thị trường buôn bán.
        </p>
        <p className="leading-relaxed text-gray-400 font-bold">
          Chỉ một chính sách nhỏ này đã lập tức thổi bùng sinh khí cho toàn bộ vùng nông thôn rộng lớn.
        </p>
      </Page></div>

      {/* Page 18: Image Prodnalog */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/prodnalog.png"
        caption="Nông dân yên tâm nộp thuế lương thực, phần còn lại thuộc quyền sở hữu của họ."
      /></div>

      {/* Page 19: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={9}>
        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
          Sự trỗi dậy của các "Nepmen"
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Cùng với nông nghiệp, thương nghiệp tự do được khôi phục. Nhà nước cho phép tư nhân mở các cửa hàng, xí nghiệp nhỏ (dưới 20 công nhân).
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Tầng lớp thương nhân tư bản tư nhân xuất hiện trở lại, được gọi là các <strong>Nepmen</strong>. Dù gây ra một số chênh lệch giàu nghèo, nhưng họ đóng vai trò quan trọng trong việc lưu thông hàng hóa, giải quyết tình trạng khan hiếm nhu yếu phẩm tại các đô thị.
        </p>
      </Page></div>

      {/* Page 20: Image Nepmen */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/nepmen.png"
        caption="Các 'Nepmen' - tầng lớp thương nhân tư nhân thịnh vượng tại các đô thị thập niên 1920."
      /></div>

      {/* Page 21: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={10}>
        <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
          Chủ nghĩa tư bản nhà nước
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Một bước đi táo bạo khác của Lênin là áp dụng "Chủ nghĩa tư bản nhà nước". Nhà nước Xô Viết cho phép tư bản nước ngoài thuê mướn xí nghiệp, nhượng tô khai thác tài nguyên.
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Đối với các xí nghiệp quốc doanh, chế độ bao cấp bị xóa bỏ. Các nhà máy phải tự hạch toán kinh tế, lấy thu bù chi và đảm bảo có lãi. Nhà nước chỉ nắm giữ chặt chẽ các "huyết mạch": ngân hàng, đường sắt, ngoại thương và công nghiệp nặng.
        </p>
      </Page></div>

      {/* Page 22: Image State Capitalism */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/state-capitalism.png"
        caption="Chủ nghĩa tư bản nhà nước: Sự hợp tác giữa nhà nước vô sản và kỹ thuật tư bản."
      /></div>

      {/* Page 23: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={11}>
        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
          Khủng hoảng "Cái Kéo" (1923)
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          NEP không phải là một con đường trải hoa hồng. Năm 1923, nền kinh tế gặp hiện tượng "Khủng hoảng cái kéo" (Scissors Crisis).
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Giá nông sản giảm mạnh (do phục hồi nhanh), trong khi giá hàng công nghiệp tăng vọt (do công nghiệp phục hồi chậm hơn). Khoảng cách giá cả mở rộng như hình một cái kéo. Nông dân bắt đầu từ chối bán lúa mì để mua hàng công nghiệp đắt đỏ. Chính phủ đã phải can thiệp điều chỉnh giá để cứu vãn thị trường.
        </p>
      </Page></div>

      {/* Page 24: Image Scissors Crisis */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/scissors-crisis.png"
        caption="Biểu tượng 'Khủng hoảng Cái Kéo': Sự chênh lệch giữa giá nông sản và công nghiệp."
      /></div>

      {/* Page 25: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={12}>
        <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
          Lenin qua đời: Tổn thất vô giá
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Tháng 1 năm 1924, V.I. Lênin qua đời sau một thời gian dài lâm bệnh. Đây là một tổn thất không thể bù đắp đối với Đảng Bôn-sê-vích và nước Nga Xô Viết.
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Dù mất đi người kiến trúc sư trưởng, NEP vẫn tiếp tục được duy trì và phát huy hiệu quả mạnh mẽ trong những năm tiếp theo, đưa nước Nga dần thoát khỏi vũng lầy nghèo đói và khôi phục hoàn toàn tiềm lực.
        </p>
      </Page></div>

      {/* Page 26: Image Lenin Funeral */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/lenin-funeral.png"
        caption="Quần chúng xót thương đưa tang Lênin giữa mùa đông lạnh giá năm 1924."
      /></div>

      {/* Page 27: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={13}>
        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
          Công nghiệp phục hồi & Kế hoạch GOELRO
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Đến năm 1926, kinh tế Xô Viết đã khôi phục về mức trước Thế chiến thứ nhất. Đặc biệt, Kế hoạch điện khí hóa toàn quốc (GOELRO) do Lênin khởi xướng đã mang lại những thành tựu rực rỡ.
        </p>
        <p className="mb-4 leading-relaxed text-gray-300 italic border-l-2 border-red-600 pl-4">
          "Chủ nghĩa cộng sản là chính quyền Xô Viết cộng với điện khí hóa toàn quốc."
        </p>
        <p className="leading-relaxed text-gray-400">
          Các nhà máy thủy điện lớn được xây dựng, tạo nền tảng vững chắc cho công cuộc công nghiệp hóa vĩ đại sau này.
        </p>
      </Page></div>

      {/* Page 28: Image Industry */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/nep-industry.png"
        caption="Kế hoạch GOELRO: Điện khí hóa toàn quốc và công cuộc kiến thiết vĩ đại."
      /></div>

      {/* Page 29: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={14}>
        <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
          Sự phân hóa nông thôn và vấn đề Phú nông
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Cùng với sự sung túc trở lại của nông thôn, sự phân hóa giai cấp cũng gia tăng. Một bộ phận nông dân làm ăn giỏi trở nên giàu có, thuê mướn nhân công - họ được gọi là các <strong>Kulak (Phú nông)</strong>.
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Điều này gây ra những cuộc tranh luận gay gắt trong nội bộ Đảng Cộng sản. Liệu việc để cho một bộ phận nhỏ làm giàu có đe dọa đến nền tảng của chủ nghĩa xã hội? Cuộc chiến ý thức hệ về số phận của các Kulak bắt đầu manh nha.
        </p>
      </Page></div>

      {/* Page 30: Image Kulaks */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/kulaks.png"
        caption="Các nông dân khá giả (Kulak) tại các vùng nông thôn nước Nga trong thời kỳ NEP."
      /></div>

      {/* Page 31: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={15}>
        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
          Kết thúc NEP: Tiến lên Công nghiệp hóa
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Vào cuối những năm 1920, I.V. Stalin củng cố quyền lực. Đối mặt với nguy cơ chiến tranh và yêu cầu phải hiện đại hóa thần tốc, giới lãnh đạo Xô Viết quyết định NEP đã hoàn thành sứ mệnh lịch sử.
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Năm 1928, NEP bị chấm dứt. Liên Xô chuyển sang mô hình kinh tế kế hoạch hóa tập trung, tập thể hóa nông nghiệp cưỡng bức và các Kế hoạch 5 năm nhằm phát triển công nghiệp nặng với tốc độ chưa từng có trong lịch sử nhân loại.
        </p>
      </Page></div>

      {/* Page 32: Image End of NEP */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/end-of-nep.png"
        caption="Stalin tuyên bố kết thúc NEP, mở đầu kỷ nguyên Kế hoạch hóa tập trung và Công nghiệp hóa."
      /></div>

      {/* Page 33: Text */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={16}>
        <h3 className="text-3xl font-bold text-red-500 mb-6 font-sans">
          Di sản của NEP trong kinh tế hiện đại
        </h3>
        <p className="mb-4 leading-relaxed text-gray-400">
          Dù chỉ tồn tại ngắn ngủi (1921-1928), nhưng NEP là một di sản lý luận kinh tế chính trị vô giá. Nó chứng minh rằng: <strong>Không thể tiến thẳng lên chủ nghĩa xã hội bằng mệnh lệnh hành chính</strong> ở một nước kinh tế kém phát triển.
        </p>
        <p className="mb-4 leading-relaxed text-gray-400">
          Tư tưởng của Lênin về việc sử dụng thị trường có sự quản lý của nhà nước vô sản đã trở thành kim chỉ nam cho công cuộc Đổi mới tại Việt Nam (1986) và Cải cách mở cửa tại Trung Quốc.
        </p>
      </Page></div>

      {/* Page 34: Image Modern Legacy */}
      <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
        image="/images/modern-legacy.png"
        caption="Thành tựu của kinh tế thị trường định hướng XHCN - Sự kế thừa rực rỡ từ tư tưởng NEP."
      /></div>

      {/* Page 35: Inside Back Cover (Blank/Epilogue) */}
      <div className="pdf-page pdf-page--text w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page>
        <div className="flex flex-col h-full justify-center items-center text-center opacity-40">
          <div className="w-24 h-px bg-red-600 mb-8"></div>
          <h3 className="uppercase tracking-widest text-lg font-bold text-white mb-4">Kết Luận</h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            Sự linh hoạt, thực tế và lòng dũng cảm tự phê bình của V.I. Lênin trong việc đề ra NEP mãi mãi là bài học kinh điển của môn Kinh tế Chính trị Mác - Lênin.
          </p>
          <div className="w-24 h-px bg-red-600 mt-8"></div>
        </div>
      </Page></div>

      {/* Page 36: Back Cover — cùng layout với bản web, tránh cắt chữ khi in PDF */}
      <div className="pdf-page pdf-page--cover-back w-[1123px] h-[794px] relative shrink-0 overflow-hidden bg-neutral-900">
        <div className="relative h-[794px] w-full overflow-hidden bg-black">
          <img src="/images/nep-cover.png" alt="Bìa sau" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-10">
            <div className="flex w-full max-w-xl flex-col items-center text-center rounded-2xl border border-red-900/40 bg-zinc-950/85 px-10 py-10 shadow-xl ring-1 ring-white/5">
              <p className="mb-2 w-full text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                Một sản phẩm của
              </p>
              <p className="mb-8 w-full text-center text-4xl font-bold tracking-wide text-white">Nhóm 6</p>
              <div className="mb-6 shrink-0 rounded-xl border border-zinc-700/70 bg-black/50 p-3 ring-1 ring-red-500/10">
                <img src="/images/QR.png" alt="QR" className="mx-auto h-36 w-36 object-contain" />
              </div>
              <div className="flex w-full flex-col items-center gap-2">
                <p className="w-full text-center text-[11px] font-semibold uppercase leading-snug tracking-[0.08em] text-red-400">
                  Quét mã để truy cập
                </p>
                <a
                  href="https://mln122-gr6.onrender.com/"
                  className="mx-auto inline-flex max-w-full items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 px-5 py-2.5 text-center text-xs font-medium text-zinc-200"
                >
                  mln122-gr6.onrender.com
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  </MagazineContext.Provider>
);
};

export default Magazine;
