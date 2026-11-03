import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    BG_DARK = RGBColor(11, 19, 43)        # #0B132B Deep Dark
    CARD_BG = RGBColor(23, 37, 84)        # #172554 Slate/Navy
    CARD_BORDER = RGBColor(59, 130, 246)  # #3B82F6 Blue
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)  # Slate 400
    ACCENT_BLUE = RGBColor(96, 165, 250)  # #60A5FA
    ACCENT_GREEN = RGBColor(52, 211, 153) # Emerald
    ACCENT_AMBER = RGBColor(251, 191, 36) # Amber
    ACCENT_PURPLE = RGBColor(192, 132, 252) # Purple

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, tag, title, subtitle=None):
        # Category Tag badge
        tb_tag = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(10), Inches(0.4))
        p_tag = tb_tag.text_frame.paragraphs[0]
        p_tag.text = tag.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = ACCENT_BLUE

        # Main Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.5), Inches(0.8))
        p_title = tb_title.text_frame.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        if subtitle:
            tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.45), Inches(11.5), Inches(0.5))
            p_sub = tb_sub.text_frame.paragraphs[0]
            p_sub.text = subtitle
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, title, items, tag_color=ACCENT_BLUE, header_icon="✦"):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = tag_color
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.25)
        tf.margin_bottom = Inches(0.25)

        # Title
        p0 = tf.paragraphs[0]
        p0.text = f"{header_icon} {title}"
        p0.font.size = Pt(17)
        p0.font.bold = True
        p0.font.color.rgb = tag_color
        p0.space_after = Pt(10)

        # Items
        for item in items:
            p = tf.add_paragraph()
            p.text = f"• {item}"
            p.font.size = Pt(12)
            p.font.color.rgb = TEXT_WHITE
            p.space_after = Pt(6)

    # -----------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -----------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Decorative banner box
    decor = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.2), Inches(10.933), Inches(5.1))
    decor.fill.solid()
    decor.fill.fore_color.rgb = CARD_BG
    decor.line.color.rgb = ACCENT_BLUE
    decor.line.width = Pt(2)

    tf = decor.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.8)

    p0 = tf.paragraphs[0]
    p0.text = "SMART EDUCATION & BIOMETRIC ATTENDANCE"
    p0.alignment = PP_ALIGN.CENTER
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_BLUE
    p0.space_after = Pt(14)

    p1 = tf.add_paragraph()
    p1.text = "MAKTAB CRM & FACE-ID TIZIMI"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(16)

    p2 = tf.add_paragraph()
    p2.text = "Zamonaviy ta'lim muassasalari uchun to'liq integratsiyalashgan aqlli boshqaruv va 6 ta Face-ID kamerali real-vaqt davomat platformasi"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.size = Pt(15)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_after = Pt(30)

    p3 = tf.add_paragraph()
    p3.text = "✦ Biometrik Davomat  |  ✦ Jonli Foye Monitori  |  ✦ Direktor & O'qituvchi Kabinetlari  |  ✦ 100% Shaffoflik"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = ACCENT_GREEN

    # -----------------------------------------------------------------
    # SLIDE 2: Muammo va Dolzarblik
    # -----------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "Muammo & Tahlil", "Bugungi Maktablardagi Mavjud Qiyinchiliklar", "An'anaviy qog'oz jurnallar va qo'lda olib boriladigan davomat tizimining kamchiliklari")

    add_card(s2, 0.8, 2.2, 3.6, 4.5, "Qog'ozbozlik va Vaqt Yo'qotish", [
        "Har kuni o'qituvchilar 10-15 daqiqa dars vaqtini faqat yo'qlama qilishga sarflaydi.",
        "Qog'oz jurnallarni to'ldirish, oylik va choraklik hisobotlarni qo'lda hisoblash juda og'ir.",
        "Inson omili tufayli xatoliklar va statistikani o'zgartirish ehtimoli yuqori."
    ], ACCENT_AMBER, "⚠️")

    add_card(s2, 4.8, 2.2, 3.6, 4.5, "Ota-onalar Bilan Aloqa Bo'shlig'i", [
        "Farzand maktabga yetib bordimi yoki yo'lda qoldimi – ota-ona o'z vaqtida bilolmaydi.",
        "Kechikishlar va dars qoldirishlar haqida faqat haftalar o'tgach xabar topiladi.",
        "Ota-onalar va maktab o'rtasida shaffof ishonch yetishmasligi yuzaga keladi."
    ], ACCENT_PURPLE, "📱")

    add_card(s2, 8.8, 2.2, 3.7, 4.5, "Rahbariyatda Real-Vaqt Nazorati Yo'q", [
        "Direktor maktab bo'yicha umumiy holatni bir zumda ko'ra olmaydi.",
        "O'qituvchilar va ishchi xodimlarning ishga kelish va ketish tartibi nazoratsiz.",
        "Tuman yoki shahar xalq ta'limiga tezkor hisobot tayyorlash kunlab vaqt oladi."
    ], RGBColor(248, 113, 113), "❌")

    # -----------------------------------------------------------------
    # SLIDE 3: Bizning Yechim
    # -----------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Innovatsion Yechim", "Maktab CRM: To'liq Raqamlashtirilgan Ekosistema", "Barcha jarayonlarni yagona tizimga birlashtiruvchi zamonaviy texnologik yechim")

    add_card(s3, 0.8, 2.2, 3.6, 4.5, "Sun'iy Intellekt & Face-ID", [
        "Kirish va chiqishda 6 ta biometrik kamera orqali 0.3 soniyada yuzni tanish.",
        "O'quvchi va xodimlar qo'l tekshirmasdan (kontakt-siz) tezkor o'tadi.",
        "Navbatlar paydo bo'lmaydi, tirbandliklarning oldi olinadi."
    ], ACCENT_BLUE, "⚡")

    add_card(s3, 4.8, 2.2, 3.6, 4.5, "Bulutli & Lokal Barqarorlik", [
        "Supabase bulutli ma'lumotlar bazasi orqali ma'lumotlar har doim xavfsiz.",
        "Internet uzilsa ham maktab lokal serveri orqali kameralar uzluksiz ishlaydi.",
        "Internet tiklangach barcha ma'lumotlar avtomatik sinxronlanadi."
    ], ACCENT_GREEN, "🛡️")

    add_card(s3, 8.8, 2.2, 3.7, 4.5, "Yagona Rolli Kabinetlar", [
        "Direktor, Navbatchi, Sinf rahbari va Fan o'qituvchisi uchun maxsus interfeys.",
        "Har bir foydalanuvchiga faqat unga tegishli ruxsatlar (RBAC) beriladi.",
        "Katta zallar uchun Jonli Foye Monitori (TV Live Display) rejimi."
    ], ACCENT_PURPLE, "👥")

    # -----------------------------------------------------------------
    # SLIDE 4: Tizim Arxitekturasi
    # -----------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "Texnik Arxitektura", "Tizim Qanday Ishlaydi?", "Terminal va kameralardan to foydalanuvchi ekranigacha bo'lgan to'liq jarayon zanjiri")

    add_card(s4, 0.8, 2.2, 2.7, 4.5, "1. Face-ID Kameralar", [
        "Maktab darvozasi va foye bo'ylab 6 ta yuqori aniqlikdagi kamera.",
        "Jonli video oqimidan yuzlarni aniqlash va biometrik ma'lumotni olish.",
        "Har qanday yorug'lik sharoitida barqaror ishlash."
    ], ACCENT_BLUE, "📷")

    add_card(s4, 3.8, 2.2, 2.7, 4.5, "2. Face Bridge Server", [
        "Node.js lokal ko'prik serveri (Port 5001).",
        "Kameralar so'rovlarini qabul qilib, yuzlarni o'quvchilar bazasi bilan solishtiradi.",
        "O'tishlarni millisekundlarda qayd etadi."
    ], ACCENT_AMBER, "⚙️")

    add_card(s4, 6.8, 2.2, 2.7, 4.5, "3. Supabase Cloud DB", [
        "Xavfsiz Postgres ma'lumotlar bazasi.",
        "Real-vaqt (WebSocket) orqali barcha qurilmalarga ma'lumot uzatish.",
        "Shifrlangan va zaxiralangan ma'lumotlar ombori."
    ], ACCENT_GREEN, "☁️")

    add_card(s4, 9.8, 2.2, 2.7, 4.5, "4. Veb Platforma & TV", [
        "Direktor tahliliy paneli.",
        "Foye jonli televizor ekrani.",
        "Sinf rahbarlari jurnali.",
        "Excel eksport & Tezkor hisobotlar."
    ], ACCENT_PURPLE, "🖥️")

    # -----------------------------------------------------------------
    # SLIDE 5: Modul 1 - Direktor Paneli
    # -----------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Asosiy Modul 1", "Direktor Dashboard: Maktab Hayoti Bir Ko'rishda", "Rahbariyat uchun qaror qabul qilishda real vaqtli analitika va to'liq nazorat")

    add_card(s5, 0.8, 2.2, 5.6, 4.5, "Umumiy Holat va Dinamika", [
        "Umumiy davomat foizi (masalan 94.8%) real vaqtda yangilanadi.",
        "Maktabdagi barcha o'quvchilar, kelganlar, kechikkanlar va kelmaganlar soni.",
        "O'qituvchilar va xodimlarning ish joyiga kelish va ketish jadvali.",
        "Kechikuvchi va dars qoldiruvchi xavf guruhidagi o'quvchilar ro'yxati."
    ], ACCENT_BLUE, "📊")

    add_card(s5, 6.8, 2.2, 5.7, 4.5, "Tahlil va Hisobotlar Generatori", [
        "Sinflararo reyting: qaysi sinfda davomat eng yuqori va qaysi birida pasayish bor.",
        "Haftalik, oylik va choraklik hisobotlarni bir tugma orqali Excel / PDF qilish.",
        "Ruxsatlarni boshqarish: har bir o'qituvchi va xodimning vakolatlarini sozlash.",
        "Maktab qo'ng'iroq va dars jadvallarini markazlashgan boshqarish."
    ], ACCENT_GREEN, "📑")

    # -----------------------------------------------------------------
    # SLIDE 6: Modul 2 - Foye Jonli Monitori
    # -----------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Asosiy Modul 2", "Jonli Foye Monitori (TV Display)", "Maktab foyesidagi katta monitorlar va televizorlar uchun interaktiv namoyish paneli")

    add_card(s6, 0.8, 2.2, 5.6, 4.5, "Katta Ekrandagi Jonli Efir", [
        "Har bir o'quvchi yoki xodim Face-ID dan o'tishi bilan uning rasmi, ismi va sinfi ekranda porlaydi.",
        "Kelgan vaqti (soat, daqiqa) va statusi (Keldi, Kech qoldi) darhol aks etadi.",
        "Jonli hisoblagich: jami kelganlar soni va umumiy davomat darajasi har soniyada o'sib boradi.",
        "O'quvchilarda mas'uliyat va tartib-intizom hissini bir necha barobar oshiradi."
    ], ACCENT_PURPLE, "📺")

    add_card(s6, 6.8, 2.2, 5.7, 4.5, "Texnik Afzalliklari", [
        "Har qanday Smart TV yoki oddiy monitor orqali brauzerda ochiladi (Port 5001/monitor).",
        "Qo'shimcha dastur yoki og'ir litsenziyalar talab qilinmaydi.",
        "Avtomatik qayta ulanish: tarmoq uzilsa ham o'zi avtomatik qayta tiklanadi.",
        "Zamonaviy, jozibador va maktab brendini yuqori darajaga ko'taruvchi futuristik dizayn."
    ], ACCENT_BLUE, "✨")

    # -----------------------------------------------------------------
    # SLIDE 7: Modul 3 - Sinf Rahbari va Fan Jurnali
    # -----------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Asosiy Modul 3", "Sinf Rahbari & Fan O'qituvchisi Kabineti", "O'qituvchilarning dars vaqti tejaladi, davomat va baholar tartibga keladi")

    add_card(s7, 0.8, 2.2, 5.6, 4.5, "Sinf Rahbari Kabineti", [
        "O'z sinfidagi har bir o'quvchining davomati 1-dars boshlanmasdanoq tayyor turadi.",
        "Kech qolganlar yoki kelmaganlar uchun sababli/sababsiz belgilash va asos hujjatlarini kiritish.",
        "Ota-onalar bilan tezkor aloqa: telefon raqami va manzili doim qo'l ostida.",
        "Choraklik davomat varaqasini avtomatik chop etish imkoniyati."
    ], ACCENT_AMBER, "👨‍🏫")

    add_card(s7, 6.8, 2.2, 5.7, 4.5, "Fan O'qituvchisi Jurnali", [
        "Dars jadvali bo'yicha kirish: qaysi sinf va qaysi fandan dars borligi avtomatik tanlanadi.",
        "Tezkor baholash tizimi: oraliq, formativ va umumiy ballarni kiritish.",
        "Mavzular taqvimi va uy vazifalarini tizimga biriktirish.",
        "Qog'oz jurnal yo'qolishi yoki buzilishi xavfidan butunlay xalos bo'lish."
    ], ACCENT_GREEN, "📚")

    # -----------------------------------------------------------------
    # SLIDE 8: Modul 4 - Xavfsizlik & Baza Boshqaruvi
    # -----------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "Asosiy Modul 4", "O'quvchilar Bazasi, Excel & Xavfsizlik", "Yuzlab o'quvchilarni 1 klikda yuklash, yangi o'quv yiliga ko'chirish va yuqori xavfsizlik")

    add_card(s8, 0.8, 2.2, 5.6, 4.5, "Excel Bilan Oson Integratsiya", [
        "Maktab bazasini Excel fayldan bir necha soniyada to'liq import qilish.",
        "O'quvchilar rasmlarini ommaviy yuklash va Face-ID ga bog'lash.",
        "Yil oxirida o'quvchilarni avtomatik keyingi sinfga ko'chirish (Promotion moduli): 1-A -> 2-A.",
        "11-sinf bitiruvchilarini avtomatik arxivga o'tkazish."
    ], ACCENT_GREEN, "📊")

    add_card(s8, 6.8, 2.2, 5.7, 4.5, "Kiberxavfsizlik & Lokal Rejim", [
        "Lokal tarmoqda mustaqil ishlash: maktab tashqi internetdan uzilsa ham turniket to'xtamaydi.",
        "Har bir foydalanuvchiga alohida parol va kirish ruxsati (RBAC).",
        "Biometrik ma'lumotlar zamonaviy shifrlash standartlarida himoyalangan.",
        "Zaxira nusxalar (Backup) avtomatik tarzda yaratiladi."
    ], ACCENT_PURPLE, "🔒")

    # -----------------------------------------------------------------
    # SLIDE 9: Natijalar va Samaradorlik
    # -----------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_header(s9, "Amaliy Natijalar", "Tizim Maktabga Nima Beradi? (ROI)", "Dastur joriy qilingandan keyingi aniq ko'rsatkichlar va erishiladigan natijalar")

    add_card(s9, 0.8, 2.2, 3.6, 4.5, "Davomat +25% Oshadi", [
        "Har bir kirish-chiqish qat'iy nazoratda bo'lgani sababli darsdan qochish va kechikishlar 90% ga kamayadi.",
        "O'quvchilarda mas'uliyat va tartib shakllanadi.",
        "Kechikishlar haqida zudlik bilan chora ko'riladi."
    ], ACCENT_GREEN, "📈")

    add_card(s9, 4.8, 2.2, 3.6, 4.5, "100+ Soat Vaqt Tejaladi", [
        "O'qituvchilar dars vaqtini faqat ta'limga sarflaydi (kuniga 15 daqiqadan har darsda).",
        "Hisobot tayyorlash vaqti bir necha kundan 5 soniyaga qisqaradi.",
        "Qog'oz va kanselyariya xarajatlari 80% gacha tejaladi."
    ], ACCENT_BLUE, "⏳")

    add_card(s9, 8.8, 2.2, 3.7, 4.5, "Ota-onalar Ishonchi", [
        "Ota-ona farzandining maktabda xavfsiz ekanligiga 100% amin bo'ladi.",
        "Maktabning zamonaviyligi va nufuzi ota-onalar va jamoatchilik oldida keskin ortadi.",
        "Ta'lim sifati va reyting ko'rsatkichlari yuqorilaydi."
    ], ACCENT_AMBER, "🤝")

    # -----------------------------------------------------------------
    # SLIDE 10: Xulosa va Savollar
    # -----------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)

    decor10 = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1))
    decor10.fill.solid()
    decor10.fill.fore_color.rgb = CARD_BG
    decor10.line.color.rgb = ACCENT_GREEN
    decor10.line.width = Pt(2)

    tf10 = decor10.text_frame
    tf10.word_wrap = True
    tf10.margin_top = Inches(0.8)

    p0 = tf10.paragraphs[0]
    p0.text = "RAQAMLI KELAJAK SARI BIRGA!"
    p0.alignment = PP_ALIGN.CENTER
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_GREEN
    p0.space_after = Pt(14)

    p1 = tf10.add_paragraph()
    p1.text = "E'tiboringiz Uchun Rahmat!"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(18)

    p2 = tf10.add_paragraph()
    p2.text = "Maktab CRM & Face-ID – Ta'limda tartib, xavfsizlik va yangi sifat bosqichi."
    p2.alignment = PP_ALIGN.CENTER
    p2.font.size = Pt(16)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_after = Pt(24)

    p3 = tf10.add_paragraph()
    p3.text = "Savol va takliflaringiz bo'lsa mamnuniyat bilan javob beramiz!"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.size = Pt(15)
    p3.font.bold = True
    p3.font.color.rgb = ACCENT_BLUE
    p3.space_after = Pt(20)

    p4 = tf10.add_paragraph()
    p4.text = "💻 START_MAKTAB.bat orqali tizimni hoziroq jonli sinab ko'rishingiz mumkin."
    p4.alignment = PP_ALIGN.CENTER
    p4.font.size = Pt(12)
    p4.font.color.rgb = TEXT_MUTED

    output_path = os.path.join(os.getcwd(), "Maktab_CRM_Taqdimot.pptx")
    prs.save(output_path)
    print(f"PowerPoint fayli saqlandi: {output_path}")

if __name__ == "__main__":
    create_deck()
