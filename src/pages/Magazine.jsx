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
      const isSmall = vw < 768;
      if (isSmall) {
        const sidePad = vw < 400 ? 16 : 24;
        const pageW = Math.min(636, Math.max(280, vw - sidePad));
        // Tránh trang quá thấp (tỉ lệ 636:450 trên màn hẹp → ~200px, cắt hết chữ):
        // dùng chiều cao tối thiểu theo viewport, vẫn giới hạn max để không vỡ layout.
        const aspectH = Math.round((pageW * 450) / 636);
        const minH = Math.min(580, Math.max(340, Math.round(vh * 0.62)));
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

const Page = React.forwardRef((props, ref) => {
  return (
    <div
      className="magazine-page-inner border-r border-zinc-800/80 shadow-magazine-inner overflow-hidden relative w-full h-full"
      ref={ref}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-700 via-red-500 to-transparent opacity-90" aria-hidden />
      <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-red-600/15 rounded-tr-md pointer-events-none" aria-hidden />
      <div className="magazine-text-column flex h-full w-full flex-col px-4 pb-5 pt-9 font-inter text-[16px] leading-[1.72] text-zinc-200 sm:px-7 sm:pb-6 sm:pt-10 sm:text-[17px] md:px-11 md:pb-7">
        <div className="magazine-page-body min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch] [&_h2]:font-outfit [&_h2]:tracking-tight [&_h3]:font-outfit [&_h3]:tracking-wide">
          {props.children}
        </div>
        {props.number && (
          <div className="magazine-page-footer mt-auto flex shrink-0 flex-col gap-1.5 border-t border-zinc-800/90 pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-4 sm:text-xs sm:tracking-[0.2em]">
            <span className="shrink-0 tabular-nums text-red-500/90">Trang {props.number}</span>
            <a
              href="https://mln122-gr6.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="magazine-footer-link break-all text-left normal-case tracking-normal text-red-400/90 [overflow-wrap:anywhere] hover:text-red-300 sm:max-w-[72%] sm:text-right"
            >
              mln122-gr6.onrender.com
            </a>
          </div>
        )}
      </div>
    </div>
  );
});

const ImagePage = React.forwardRef((props, ref) => {
  return (
    <div className="bg-zinc-950 overflow-hidden relative w-full h-full magazine-image-frame" ref={ref}>
      <img
        src={props.image}
        alt={props.caption || 'Magazine Page'}
        className="w-full h-full object-cover absolute inset-0 scale-[1.01]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50" />
      <div className="absolute inset-0 bg-black/15 mix-blend-multiply" />
      {props.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-5 pt-16 bg-gradient-to-t from-black/95 via-black/55 to-transparent">
          <div className="backdrop-blur-[2px] rounded-sm border-l-[3px] border-red-500 bg-black/25 pl-4 pr-2 py-2 max-w-[95%]">
            <p className="text-zinc-100 text-[13px] md:text-sm font-inter leading-snug italic text-balance">
              {props.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

const CoverPage = React.forwardRef((props, ref) => {
  return (
    <div className="bg-black overflow-hidden relative w-full h-full" ref={ref}>
      <img src={props.image} alt="Cover Page" className="w-full h-full object-cover absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 flex flex-col justify-end p-8 md:p-12 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(220,38,38,0.12),transparent)] pointer-events-none" />
        {props.children}
      </div>
    </div>
  );
});

const Magazine = () => {
  const printRef = useRef();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const book = useMagazineBookSize();

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
        logging: false,
        backgroundColor: '#171717',
        windowWidth: 1123,
        windowHeight: 794,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: { unit: 'px', format: [1123, 794], orientation: 'landscape', compress: true }
    };

    // Process pages sequentially to avoid canvas limits
    import('html2pdf.js').then((html2pdf) => {
      setTimeout(async () => {
        try {
          const pages = Array.from(printRef.current.querySelectorAll('.pdf-page'));
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
    <div className="magazine-shell min-h-screen flex flex-col items-center justify-center overflow-x-hidden px-3 py-6 font-inter selection:bg-red-900/40 selection:text-red-100 sm:px-6 lg:p-10">

      <header className="mb-6 w-full max-w-3xl sm:mb-8">
        <div className="relative rounded-2xl border border-red-900/35 bg-zinc-900/60 backdrop-blur-xl px-6 py-5 shadow-magazine overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-red-500/90 mb-1.5">Tạp chí điện tử</p>
              <h1 className="font-outfit text-lg sm:text-xl font-bold text-white tracking-wide">
                Hồ sơ đặc biệt <span className="text-red-500">·</span> 36 trang
              </h1>
              <p className="text-zinc-500 text-xs mt-1.5 max-w-md">
                Kéo góc trang hoặc nhấn để lật — chủ đề Kinh tế chính trị Mác — Lênin
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/40 ring-1 ring-red-500/30 transition hover:from-red-500 hover:to-red-600 hover:shadow-red-800/50 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang tạo PDF...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tải PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="magazine-viewport w-full max-w-[min(100vw-1.5rem,780px)] sm:max-w-none">
        <p className="mb-3 px-1 text-center text-[11px] leading-snug text-zinc-500 md:hidden" aria-live="polite">
          Một trang / màn hình — cuộn trong trang nếu nội dung dài; chạm góc để lật trang
        </p>
        <HTMLFlipBook
          key={`flip-${book.usePortrait}-${book.width}-${book.height}`}
          width={book.width}
          height={book.height}
          size="stretch"
          minWidth={book.usePortrait ? book.width : 420}
          maxWidth={book.usePortrait ? book.width : 780}
          minHeight={book.usePortrait ? book.height : 315}
          maxHeight={book.usePortrait ? book.height : 550}
          maxShadowOpacity={0.5}
          showCover={true}
          usePortrait={book.usePortrait}
          mobileScrollSupport={true}
          className="magazine-flipbook mx-auto w-full max-w-full"
        >
        {/* Page 1: Cover */}
        <div className="bg-black overflow-hidden relative w-full h-full">
          <img src="/images/nep-cover.png" alt="Cover Page" className="w-full h-full object-cover absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_80%,rgba(220,38,38,0.15),transparent)] z-10 pointer-events-none" />
          <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 z-20">
            <p className="font-outfit text-[10px] md:text-xs font-semibold uppercase tracking-[0.45em] text-white mb-3">Kinh tế chính trị · Số đặc biệt</p>
            <div className="border-l-[6px] border-red-500 pl-6 md:pl-8 py-1">
              <h1 className="font-outfit text-5xl sm:text-6xl md:text-7xl font-black text-white uppercase leading-[0.95] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] flex flex-wrap items-baseline gap-3 md:gap-4">
                NEP <span className="text-red-500">1921</span>
              </h1>
              <p className="font-outfit text-white/95 font-semibold tracking-[0.25em] uppercase text-sm md:text-base mt-4 max-w-lg leading-relaxed">
                Sự lùi bước vĩ đại của Lênin
              </p>
            </div>
          </div>
        </div>

        {/* Page 2: Inside Cover (Credits) */}
        <Page>
          <div className="flex flex-col h-full justify-center items-center text-center px-2">
            <div className="w-20 h-20 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-zinc-900/80 flex items-center justify-center text-2xl font-black mb-5 text-red-400 font-outfit shadow-lg shadow-red-950/40 ring-1 ring-red-500/20">
              G6
            </div>
            <h3 className="font-outfit uppercase tracking-[0.28em] text-base font-bold text-white mb-1">Ban biên tập</h3>
            <p className="text-sm text-zinc-500 mb-6 font-normal">Chuyên đề Kinh tế Chính trị Mác — Lênin</p>

            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-4 mb-5 shadow-inner shadow-black/40 ring-1 ring-white/5 transition-transform hover:scale-[1.02]">
              <img src="/images/qrcode2.jpg" alt="QR truy cập dự án" className="w-28 h-28 md:w-32 md:h-32 object-contain mx-auto" />
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
          <h2 className="font-outfit text-2xl md:text-3xl font-bold text-white mb-6 leading-snug">
            Khi màn đêm bao phủ <span className="text-red-500">Đế quốc Nga</span>
          </h2>
          <p className="mb-4 text-[15px] md:text-base leading-relaxed text-zinc-300">
            Để hiểu được sự vĩ đại của Chính sách Kinh tế mới (NEP), chúng ta phải nhìn lại điểm xuất phát tăm tối của nước Nga vào đầu thế kỷ 20.
          </p>
          <p className="leading-relaxed text-zinc-400">
            Chiến tranh thế giới thứ nhất đã vắt kiệt sinh lực của một đế chế nông nghiệp lạc hậu. Hàng triệu thanh niên nông dân bị ném vào các chiến hào đẫm máu. Ở hậu phương, lạm phát phi mã, công nghiệp đình đốn và nạn đói bắt đầu lan rộng khắp các đô thị lớn. Nước Nga Sa Hoàng đang đứng trên bờ vực của sự sụp đổ hoàn toàn.
          </p>
          <div className="mt-8 h-1 w-16 rounded-full bg-gradient-to-r from-red-600 to-red-800/50" />
        </Page>

        {/* Page 4: Image WW1 */}
        <ImagePage
          image="/images/ww1-russia.png"
          caption="Nước Nga kiệt quệ trong những chiến hào lầy lội của Thế chiến I."
        />

        {/* Page 5: Text */}
        <Page number={2}>
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
        </Page>

        {/* Page 6: Image October Rev */}
        <ImagePage
          image="/images/october-revolution.png"
          caption="Cách mạng Tháng Mười - Sự kiện rung chuyển thế giới năm 1917."
        />

        {/* Page 7: Text */}
        <Page number={3}>
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
            Chính sách "Cộng sản thời chiến"
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Trong tình thế "ngàn cân treo sợi tóc", để tập trung mọi nguồn lực cho mặt trận, chính quyền Xô Viết buộc phải thi hành chính sách "Cộng sản thời chiến".
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
          <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
            Nền kinh tế bên bờ vực thẳm
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Đến năm 1920, dù đã chiến thắng trong nội chiến, nhưng "Cộng sản thời chiến" đã triệt tiêu hoàn toàn động lực sản xuất của nông dân. Họ chỉ trồng đủ ăn, nhiều vùng còn cố tình phá hoại mùa màng.
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
            Tiếng chuông cảnh tỉnh Kronstadt
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Sự bất mãn lên đến đỉnh điểm vào mùa xuân năm 1921. Khắp nơi nông dân nổi dậy. Đỉnh điểm là cuộc nổi dậy của các thủy thủ tại căn cứ hải quân Kronstadt - lực lượng từng là nòng cốt trung kiên nhất của Cách mạng Tháng Mười.
          </p>
          <p className="leading-relaxed text-gray-400">
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
        </Page>

        {/* Page 14: Image Lenin Speech */}
        <ImagePage
          image="/images/lenin-speech.png"
          caption="V.I. Lênin đọc báo cáo lịch sử tại Đại hội X (tháng 3/1921)."
        />

        {/* Page 15: Text */}
        <Page number={7}>
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
            Khai sinh Chính sách Kinh tế Mới
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Chính sách Kinh tế Mới (NEP) đánh dấu sự thay đổi tư duy triệt để. Từ chỗ cố gắng xóa bỏ ngay lập tức kinh tế hàng hóa, Lênin chủ trương sử dụng chính thị trường, tiền tệ và quan hệ hàng hóa làm "đòn bẩy" để xây dựng chủ nghĩa xã hội.
          </p>
          <p className="leading-relaxed text-gray-400">
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
        </Page>

        {/* Page 18: Image Prodnalog */}
        <ImagePage
          image="/images/prodnalog.png"
          caption="Nông dân yên tâm nộp thuế lương thực, phần còn lại thuộc quyền sở hữu của họ."
        />

        {/* Page 19: Text */}
        <Page number={9}>
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
            Sự trỗi dậy của các "Nepmen"
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Cùng với nông nghiệp, thương nghiệp tự do được khôi phục. Nhà nước cho phép tư nhân mở các cửa hàng, xí nghiệp nhỏ (dưới 20 công nhân).
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
          <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
            Chủ nghĩa tư bản nhà nước
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Một bước đi táo bạo khác của Lênin là áp dụng "Chủ nghĩa tư bản nhà nước". Nhà nước Xô Viết cho phép tư bản nước ngoài thuê mướn xí nghiệp, nhượng tô khai thác tài nguyên.
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
            Khủng hoảng "Cái Kéo" (1923)
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            NEP không phải là một con đường trải hoa hồng. Năm 1923, nền kinh tế gặp hiện tượng "Khủng hoảng cái kéo" (Scissors Crisis).
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
          <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
            Lenin qua đời: Tổn thất vô giá
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Tháng 1 năm 1924, V.I. Lênin qua đời sau một thời gian dài lâm bệnh. Đây là một tổn thất không thể bù đắp đối với Đảng Bôn-sê-vích và nước Nga Xô Viết.
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
        </Page>

        {/* Page 28: Image Industry */}
        <ImagePage
          image="/images/nep-industry.png"
          caption="Kế hoạch GOELRO: Điện khí hóa toàn quốc và công cuộc kiến thiết vĩ đại."
        />

        {/* Page 29: Text */}
        <Page number={14}>
          <h3 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-wider">
            Sự phân hóa nông thôn và vấn đề Phú nông
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Cùng với sự sung túc trở lại của nông thôn, sự phân hóa giai cấp cũng gia tăng. Một bộ phận nông dân làm ăn giỏi trở nên giàu có, thuê mướn nhân công - họ được gọi là các <strong>Kulak (Phú nông)</strong>.
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
          <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
            Kết thúc NEP: Tiến lên Công nghiệp hóa
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Vào cuối những năm 1920, I.V. Stalin củng cố quyền lực. Đối mặt với nguy cơ chiến tranh và yêu cầu phải hiện đại hóa thần tốc, giới lãnh đạo Xô Viết quyết định NEP đã hoàn thành sứ mệnh lịch sử.
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
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
          <h3 className="text-3xl font-bold text-red-500 mb-6 font-sans">
            Di sản của NEP trong kinh tế hiện đại
          </h3>
          <p className="mb-4 leading-relaxed text-gray-400">
            Dù chỉ tồn tại ngắn ngủi (1921-1928), nhưng NEP là một di sản lý luận kinh tế chính trị vô giá. Nó chứng minh rằng: <strong>Không thể tiến thẳng lên chủ nghĩa xã hội bằng mệnh lệnh hành chính</strong> ở một nước kinh tế kém phát triển.
          </p>
          <p className="mb-4 leading-relaxed text-gray-400">
            Tư tưởng của Lênin về việc sử dụng thị trường có sự quản lý của nhà nước vô sản đã trở thành kim chỉ nam cho công cuộc Đổi mới tại Việt Nam (1986) và Cải cách mở cửa tại Trung Quốc.
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
          <img src="/images/nep-cover.png" alt="Bìa sau" className="w-full h-full object-cover absolute inset-0 opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
          <div className="absolute inset-0 flex flex-col justify-center items-center z-10 p-3 sm:p-4">
            <div className="w-full max-w-[min(100%,22rem)] flex flex-col items-center text-center rounded-2xl border border-red-900/40 bg-zinc-950/80 backdrop-blur-xl px-5 py-6 sm:p-8 shadow-magazine ring-1 ring-white/5">
              <p className="font-outfit text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-1.5 w-full text-center">
                Một sản phẩm của
              </p>
              <p className="font-outfit text-3xl font-bold text-white tracking-wide mb-6 w-full text-center">Nhóm 6</p>

              <div className="rounded-xl border border-zinc-700/70 bg-black/40 p-2.5 ring-1 ring-red-500/10 shrink-0">
                <img src="/images/qrcode2.jpg" alt="QR truy cập" className="w-[7.25rem] h-[7.25rem] sm:w-28 sm:h-28 object-contain mx-auto" />
              </div>

              <div className="mt-4 flex w-full flex-col items-center gap-2">
                <p className="w-full text-center text-red-400 font-semibold uppercase text-[10px] leading-snug tracking-[0.08em] px-2">
                  Quét mã để truy cập
                </p>
                <a
                  href="https://mln122-gr6.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-auto inline-flex max-w-full items-center justify-center rounded-full border border-zinc-600 bg-zinc-900/95 px-4 py-2 text-center text-[11px] font-medium text-zinc-200 transition-colors hover:border-red-500/40 hover:text-white"
                >
                  mln122-gr6.onrender.com
                </a>
              </div>

              
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
        <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page>
          <div className="flex flex-col h-full justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full border-2 border-red-600 flex items-center justify-center text-xl font-black mb-4 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              G6
            </div>
            <h3 className="uppercase tracking-[0.3em] text-lg font-bold text-white mb-2">Ban Biên Tập</h3>
            <p className="text-sm text-gray-400 mb-8 font-light">Chuyên đề Kinh tế Chính trị Mác - Lênin</p>
            
            <div className="bg-transparent p-2 rounded-lg shadow-xl mb-4 transform transition-transform hover:scale-105 inline-block">
              <img src="/images/qrcode2.jpg" alt="QR Code" className="w-32 h-32 object-contain" />
            </div>
            
            <p className="text-red-500 font-bold tracking-widest uppercase text-xs mb-2">Quét mã để truy cập</p>
            <a href="https://mln122-gr6.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-xs hover:text-white transition-colors">
              mln122-gr6.onrender.com
            </a>
            
            <p className="text-xs text-zinc-600 mt-8">Xuất bản: Tháng 3 / 2026</p>
          </div>
        </Page></div>

          {/* Page 3: Lời tựa / Bối cảnh */}
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={1}>
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
          </Page></div>

          {/* Page 4: Image WW1 */}
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><ImagePage
            image="/images/ww1-russia.png"
            caption="Nước Nga kiệt quệ trong những chiến hào lầy lội của Thế chiến I."
          /></div>

          {/* Page 5: Text */}
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={2}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={3}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={4}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={5}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={6}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={7}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={8}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={9}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={10}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={11}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={12}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={13}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={14}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={15}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page number={16}>
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
          <div className="pdf-page w-[1123px] h-[794px] relative shrink-0 overflow-hidden text-[#d4d4d8] bg-neutral-900"><Page>
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
                    <img src="/images/qrcode2.jpg" alt="QR" className="mx-auto h-36 w-36 object-contain" />
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

  );
};

export default Magazine;
