import React, { useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';

const Page = React.forwardRef((props, ref) => {
  return (
    <div 
      className="bg-neutral-900 border-r border-neutral-800 shadow-[inset_-10px_0px_20px_rgba(0,0,0,0.5)] overflow-hidden relative" 
      ref={ref}
    >
      <div className="w-full h-full flex flex-col p-8 md:p-12 relative text-gray-200 font-sans">
        {props.children}
        {props.number && (
          <div className="absolute bottom-6 left-0 w-full text-center text-zinc-600 text-xs font-sans tracking-widest">
            {props.number}
          </div>
        )}
      </div>
    </div>
  );
});

const ImagePage = React.forwardRef((props, ref) => {
  return (
    <div className="bg-black overflow-hidden relative" ref={ref}>
      <div 
        className="w-full h-full bg-cover bg-center" 
        style={{ backgroundImage: `url(${props.image})` }}
      >
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        {props.caption && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20">
            <p className="text-gray-300 text-sm font-sans italic border-l-2 border-red-600 pl-3">
              {props.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

const CoverPage = React.forwardRef((props, ref) => {
  return (
    <div className="bg-black overflow-hidden relative" ref={ref}>
      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${props.image})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
          {props.children}
        </div>
      </div>
    </div>
  );
});

const Magazine = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      
      <div className="mb-6 text-center">
        <h2 className="text-red-600 font-bold tracking-[0.2em] uppercase text-sm mb-2">Hồ Sơ Đặc Biệt: 36 Trang</h2>
        <p className="text-gray-500 text-xs">Sử dụng chuột kéo hoặc click vào góc trang để lật mở</p>
      </div>

      <HTMLFlipBook
        width={636}
        height={450}
        size="stretch"
        minWidth={420}
        maxWidth={780}
        minHeight={315}
        maxHeight={550}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="magazine-flipbook mx-auto"
      >
        {/* Page 1: Cover */}
        <CoverPage image="/images/nep-cover.png">
          <div className="border-l-4 border-red-600 pl-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase mb-2 leading-none drop-shadow-lg">
              NEP <span className="text-red-600">1921</span>
            </h1>
            <p className="text-gray-300 font-medium tracking-widest uppercase text-sm">
              Sự lùi bước vĩ đại của Lênin
            </p>
          </div>
        </CoverPage>

        {/* Page 2: Inside Cover (Credits) */}
        <Page>
          <div className="flex flex-col h-full justify-center items-center text-center opacity-40">
            <div className="w-16 h-16 rounded-full border-2 border-red-600 flex items-center justify-center text-xl font-black mb-4 text-red-500">
              G6
            </div>
            <h3 className="uppercase tracking-widest text-sm font-bold text-white mb-2">Ban Biên Tập</h3>
            <p className="text-xs text-gray-400">Chuyên đề Kinh tế Chính trị Mác - Lênin</p>
            <p className="text-xs text-gray-500 mt-8">Xuất bản: Tháng 3 / 2026</p>
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
          <div className="flex flex-col h-full justify-center items-center text-center opacity-40">
            <div className="w-24 h-px bg-red-600 mb-8"></div>
            <h3 className="uppercase tracking-widest text-lg font-bold text-white mb-4">Kết Luận</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Sự linh hoạt, thực tế và lòng dũng cảm tự phê bình của V.I. Lênin trong việc đề ra NEP mãi mãi là bài học kinh điển của môn Kinh tế Chính trị Mác - Lênin.
            </p>
            <div className="w-24 h-px bg-red-600 mt-8"></div>
          </div>
        </Page>

        {/* Page 36: Back Cover */}
        <CoverPage image="/images/nep-cover.png">
          <div className="w-full h-full flex flex-col justify-center items-center bg-black/80 backdrop-blur-sm p-8 text-center">
            <h2 className="text-3xl font-black text-red-600 mb-4 tracking-[0.2em]">HẾT</h2>
            <div className="w-16 h-px bg-white/30 mb-8"></div>
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Một sản phẩm của</p>
            <p className="text-white font-bold text-xl mb-8">Nhóm 6</p>
            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
              Mô phỏng tạp chí tương tác 36 trang phục vụ bộ môn Kinh Tế Chính Trị Mác - Lênin.
            </p>
          </div>
        </CoverPage>
      </HTMLFlipBook>
    </div>
  );
};

export default Magazine;
