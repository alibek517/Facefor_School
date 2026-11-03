import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml import parse_xml

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen format
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Premium Color Palette
    BG_DARK = RGBColor(11, 19, 43)          # #0B132B Deep Dark Space
    CARD_BG = RGBColor(22, 36, 71)          # #162447 Elevated Card Navy
    CARD_BG_ALT = RGBColor(30, 48, 90)      # Slightly brighter navy
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)    # Slate 400
    TEXT_DIM = RGBColor(100, 116, 139)      # Slate 500

    ACCENT_CYAN = RGBColor(56, 189, 248)    # #38BDF8 Sky Blue
    ACCENT_BLUE = RGBColor(59, 130, 246)    # #3B82F6 Blue
    ACCENT_GREEN = RGBColor(16, 185, 129)   # #10B981 Emerald
    ACCENT_AMBER = RGBColor(245, 158, 11)   # #F59E0B Amber
    ACCENT_PURPLE = RGBColor(168, 85, 247)  # #A855F7 Violet
    ACCENT_ROSE = RGBColor(244, 63, 94)     # #F43F5E Rose

    # Helper: Set dark background
    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    # Helper: Add native slide transition
    def add_transition(slide, trans_type="push", direction="l"):
        xml_map = {
            "fade": '<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:fade/></p:transition>',
            "push": f'<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:push dir="{direction}"/></p:transition>',
            "wipe": f'<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:wipe dir="{direction}"/></p:transition>',
            "split": '<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:split dir="in"/></p:transition>',
            "wheel": '<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:wheel spokes="4"/></p:transition>',
        }
        tx_str = xml_map.get(trans_type, xml_map["push"])
        tx_elem = parse_xml(tx_str)
        slide._element.append(tx_elem)

    # Helper: Add speaker notes
    def add_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # Helper: Slide header
    def add_slide_header(slide, badge_text, title_text, subtitle_text=None, badge_color=ACCENT_CYAN):
        # Badge Pill
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(3.2), Inches(0.38))
        badge.fill.solid()
        badge.fill.fore_color.rgb = CARD_BG
        badge.line.color.rgb = badge_color
        badge.line.width = Pt(1.5)
        tf_b = badge.text_frame
        tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_b = tf_b.paragraphs[0]
        p_b.text = f"✦  {badge_text.upper()}"
        p_b.font.size = Pt(10)
        p_b.font.bold = True
        p_b.font.color.rgb = badge_color
        p_b.alignment = PP_ALIGN.CENTER

        # Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.8))
        p_t = tb_title.text_frame.paragraphs[0]
        p_t.text = title_text
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(25)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE

        if subtitle_text:
            tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(0.45))
            p_s = tb_sub.text_frame.paragraphs[0]
            p_s.text = subtitle_text
            p_s.font.name = "Segoe UI"
            p_s.font.size = Pt(12)
            p_s.font.color.rgb = TEXT_MUTED

    # Helper: Feature Card
    def add_card(slide, left, top, width, height, title, items, tag_color=ACCENT_CYAN, icon_char="✦", bg_color=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = tag_color
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.25)
        tf.margin_bottom = Inches(0.2)

        # Title Paragraph
        p0 = tf.paragraphs[0]
        p0.text = f"{icon_char}  {title}"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(16)
        p0.font.bold = True
        p0.font.color.rgb = tag_color
        p0.space_after = Pt(10)

        for it in items:
            p = tf.add_paragraph()
            p.text = f"•  {it}"
            p.font.name = "Segoe UI"
            p.font.size = Pt(11.5)
            p.font.color.rgb = TEXT_WHITE
            p.space_after = Pt(6)

        return card

    # =================================================================
    # SLIDE 1: Title Slide (Hero)
    # =================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)
    add_transition(s1, "fade")

    # Main Center Container Card
    hero_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.9), Inches(11.333), Inches(5.7))
    hero_card.fill.solid()
    hero_card.fill.fore_color.rgb = CARD_BG
    hero_card.line.color.rgb = ACCENT_CYAN
    hero_card.line.width = Pt(2)

    tf1 = hero_card.text_frame
    tf1.word_wrap = True
    tf1.margin_top = Inches(0.6)

    p_badge = tf1.paragraphs[0]
    p_badge.text = "✦  SMART SCHOOL & BIOMETRIC ATTENDANCE ECOSYSTEM  ✦"
    p_badge.alignment = PP_ALIGN.CENTER
    p_badge.font.name = "Segoe UI"
    p_badge.font.size = Pt(12)
    p_badge.font.bold = True
    p_badge.font.color.rgb = ACCENT_CYAN
    p_badge.space_after = Pt(16)

    p_title = tf1.add_paragraph()
    p_title.text = "MAKTAB CRM & FACE-ID TIZIMI"
    p_title.alignment = PP_ALIGN.CENTER
    p_title.font.name = "Segoe UI"
    p_title.font.size = Pt(38)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_WHITE
    p_title.space_after = Pt(14)

    p_desc = tf1.add_paragraph()
    p_desc.text = "6 ta Face-ID kamerasi, Foye jonli monitori, direktor tahliliy paneli va o'qituvchilar kabineti mujassamlashgan to'liq avtomatlashtirilgan ta'lim platformasi"
    p_desc.alignment = PP_ALIGN.CENTER
    p_desc.font.name = "Segoe UI"
    p_desc.font.size = Pt(14)
    p_desc.font.color.rgb = TEXT_MUTED
    p_desc.space_after = Pt(36)

    # 4 Quick Pillar Badges inside Slide 1
    pillars = [
        ("⚡ 0.3s Tezkorlik", "Biometrik yuzni tanish"),
        ("📹 6 ta Kamera", "Maktab darvoza va foyesi"),
        ("📺 Jonli Monitor", "Katta TV display tablosi"),
        ("🛡️ Lokal Ko'prik", "Internet uzilsa ham ishlaydi")
    ]
    p_box_w = 2.4
    p_gap = 0.3
    p_start_x = 1.45
    p_y = 4.8
    for idx, (head, sub) in enumerate(pillars):
        x = p_start_x + idx * (p_box_w + p_gap)
        box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(p_y), Inches(p_box_w), Inches(1.3))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG_ALT
        box.line.color.rgb = ACCENT_CYAN
        box.line.width = Pt(1)
        tf_box = box.text_frame
        tf_box.word_wrap = True
        tf_box.margin_top = Inches(0.2)
        p_h = tf_box.paragraphs[0]
        p_h.text = head
        p_h.alignment = PP_ALIGN.CENTER
        p_h.font.bold = True
        p_h.font.size = Pt(13)
        p_h.font.color.rgb = ACCENT_GREEN
        p_s = tf_box.add_paragraph()
        p_s.text = sub
        p_s.alignment = PP_ALIGN.CENTER
        p_s.font.size = Pt(9.5)
        p_s.font.color.rgb = TEXT_WHITE

    add_notes(s1, "Assalomu alaykum hurmatli qatnashchilar! Bugun sizlarga zamonaviy ta'lim muassasalarini raqamlashtirish bo'yicha ishlab chiqqan 'Maktab CRM va Face-ID' innovatsion platformasini taqdim etamiz. Ushbu tizim maktabdagi davomat, xavfsizlik, o'quv jarayonlari va hisobotlarni bir nuqtadan avtomatlashtirish imkonini beradi.")

    # =================================================================
    # SLIDE 2: Muammolar va Dolzarblik
    # =================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_transition(s2, "push", "l")
    add_slide_header(s2, "Mavjud Muammolar", "Bugungi Maktablardagi Asosiy Qiyinchiliklar", "An'anaviy qog'oz jurnallar va qo'lda davomat olish tizimining salbiy oqibatlari", ACCENT_ROSE)

    add_card(s2, 0.8, 2.15, 3.65, 4.6, "Dars Vaqti Isrof Bo'lishi", [
        "Har kuni o'qituvchilar darsning dastlabki 10-15 daqiqasini yo'qlama qilishga sarflaydi.",
        "Oyiga o'nlab soat qimmatli pedagogik ta'lim vaqti yo'qoladi.",
        "Choraklik va yillik davomat hisobotlarini qog'ozda hisob-kitob qilish o'ta mashaqqatli.",
        "O'qituvchi asosiy e'tiborini dars berishga emas, hujjat to'ldirishga qaratadi."
    ], ACCENT_ROSE, "⏳")

    add_card(s2, 4.8, 2.15, 3.65, 4.6, "Nazorat va Shaffoflik Yo'qligi", [
        "O'quvchi maktab darvozasidan kirmay darsdan qochsa, rahbar buni darhol bilolmaydi.",
        "Inson omili tufayli 'tanish-bilishchilik' orqali davomatni soxtalashtirish ehtimoli bor.",
        "O'qituvchilar va xodimlarning ishga kelish va ketish vaqti aniq qayd etilmaydi.",
        "Maktab hududiga begona shaxslarning kirishi ustidan to'liq nazorat yo'q."
    ], ACCENT_AMBER, "⚠️")

    add_card(s2, 8.8, 2.15, 3.7, 4.6, "Ota-onalar Bilan Aloqa Yetishmasligi", [
        "Ota-ona o'z farzandining maktabga eson-omon yetib borganidan xabarsiz qoladi.",
        "Kechikishlar va dars qoldirishlar haqida faqat chorak yakunida bilishadi.",
        "Ota-onalar va maktab ma'muriyati o'rtasida ishonch susayadi.",
        "Favqulodda vaziyatlarda ota-onaga tezkor xabar yetkazish mexanizmi mavjud emas."
    ], ACCENT_PURPLE, "📱")

    add_notes(s2, "Birinchi slaydda ko'rib turganingizdek, an'anaviy ta'lim muassasalarida 3 ta katta og'riqli nuqta bor: har bir darsda 15 daqiqagacha vaqt yo'qlamaga ketadi, o'quvchilarning real davomatini nazorat qilish qiyin va eng asosiysi – ota-onalar farzandining maktabdaligidan bexabar qolishadi.")

    # =================================================================
    # SLIDE 3: Bizning Yechim
    # =================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_transition(s3, "push", "l")
    add_slide_header(s3, "Bizning Yechim", "Maktab CRM: To'liq Raqamli Ekosistema", "Barcha jarayonlarni o'zaro bog'lovchi yagona aqlli boshqaruv markazi", ACCENT_GREEN)

    add_card(s3, 0.8, 2.15, 3.65, 4.6, "0.3s Biometrik Face-ID", [
        "Hech qanday plastik karta, QR-kod yoki barmoq izi talab etilmaydi.",
        "6 ta biometrik kamera o'quvchi va xodimlarni yuzidan 0.3 soniyada taniydi.",
        "Turniket va eshiklarni kontakt-siz, tezkor ochadi.",
        "Daqiqasiga 60+ kishini o'tkazish orqali tirbandlikning oldini oladi."
    ], ACCENT_CYAN, "⚡")

    add_card(s3, 4.8, 2.15, 3.65, 4.6, "Katta Zallar Uchun Foye TV", [
        "Maktab foyesidagi katta monitor va televizorlarda kirganlar jonli efirda aks etadi.",
        "O'quvchining rasmi, ismi, sinfi va o'tgan vaqti ekranda ko'rinadi.",
        "O'quvchilarda intizom, mas'uliyat va maktabidan faxrlanish hissini uyg'otadi.",
        "Maktabga tashrif buyurgan ota-onalar va mehmonlarda zamonaviy taassurot qoldiradi."
    ], ACCENT_PURPLE, "📺")

    add_card(s3, 8.8, 2.15, 3.7, 4.6, "Rolli Veb Kabinetlar", [
        "Direktor, Navbatchi, Sinf rahbari va Fan o'qituvchisi uchun alohida ish stollari.",
        "Har bir foydalanuvchiga faqat unga tegishli vazifalar va ma'lumotlar beriladi (RBAC).",
        "Kompyuter, planshet va noutbuklarda qulay ochiladi.",
        "Excel formatida bir martalik ommaviy yuklash va hisobotlarni eksport qilish."
    ], ACCENT_GREEN, "👥")

    add_notes(s3, "Biz taklif qilayotgan yechim – bu sun'iy intellektga asoslangan Face-ID biometrik nazorati, foye uchun jonli televizor ekrani va pedagoglar hamda rahbarlar uchun qulay veb-kabinetlardan iborat yagona platformadir.")

    # =================================================================
    # SLIDE 4: Tizim Arxitekturasi
    # =================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_transition(s4, "wipe", "r")
    add_slide_header(s4, "Texnik Arxitektura", "Tizim Qanday Ishlaydi?", "Kameralardan tortib direktor ekranigacha bo'lgan to'liq jarayon zanjiri", ACCENT_BLUE)

    steps = [
        ("1. Kameralar", "6 ta Biometrik IP Kamera", [
            "Darvoza va kirishda o'rnatilgan.",
            "Video oqimidan yuzlarni ajratib oladi.",
            "Yuqori aniqlikdagi aniqlash."
        ], ACCENT_CYAN, "📷"),
        ("2. Lokal Server", "Face-Bridge Ko'prik (Port 5001)", [
            "Node.js server maktab kompyuterida.",
            "Lokal o'tishlarni millisekundda solishtiradi.",
            "Internet uzilsa ham to'xtovsiz ishlaydi."
        ], ACCENT_AMBER, "⚙️"),
        ("3. Bulut Baza", "Supabase Cloud Database", [
            "Xavfsiz Postgres ma'lumotlar ombori.",
            "Real-time WebSocket orqali sinxronlash.",
            "Shifrlangan va xavfsiz zaxira nusxalar."
        ], ACCENT_GREEN, "☁️"),
        ("4. Foydalanuvchi", "Web CRM & Foye Tablosi", [
            "Direktor tahliliy paneli.",
            "Foye Smart TV jonli tablosi.",
            "Sinf rahbari va o'qituvchi jurnali."
        ], ACCENT_PURPLE, "🖥️")
    ]

    s_w = 2.7
    s_gap = 0.28
    s_x = 0.8
    for idx, (step_num, title, bullets, col, icon) in enumerate(steps):
        x = s_x + idx * (s_w + s_gap)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(2.15), Inches(s_w), Inches(4.0))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        card.line.width = Pt(1.5)

        tf_s = card.text_frame
        tf_s.word_wrap = True
        tf_s.margin_left = Inches(0.2)
        tf_s.margin_right = Inches(0.2)
        tf_s.margin_top = Inches(0.25)

        p_ic = tf_s.paragraphs[0]
        p_ic.text = f"{icon}  {step_num}"
        p_ic.font.size = Pt(13)
        p_ic.font.bold = True
        p_ic.font.color.rgb = col
        p_ic.space_after = Pt(6)

        p_t = tf_s.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_after = Pt(10)

        for b in bullets:
            p_b = tf_s.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.size = Pt(10.5)
            p_b.font.color.rgb = TEXT_MUTED
            p_b.space_after = Pt(4)

    # Bottom Callout: Offline Resilience
    bot_box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.3), Inches(11.7), Inches(0.8))
    bot_box.fill.solid()
    bot_box.fill.fore_color.rgb = CARD_BG_ALT
    bot_box.line.color.rgb = ACCENT_GREEN
    bot_box.line.width = Pt(1.5)
    tf_bot = bot_box.text_frame
    tf_bot.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_bot = tf_bot.paragraphs[0]
    p_bot.text = "🛡️  LOKAL AVTONOMIYA: Maktabda internet vaqtincha uzilib qolsa ham tizim to'xtamaydi! Lokal server barcha o'tishlarni saqlaydi va aloqa tiklangach avtomatik bulutga yuboradi."
    p_bot.font.size = Pt(11)
    p_bot.font.bold = True
    p_bot.font.color.rgb = TEXT_WHITE

    add_notes(s4, "Texnik arxitektura juda ishonchli: 6 ta kamera o'quvchini ko'radi, lokal 'Face-Bridge' serveri uni solishtirib bazaga yozadi, va ma'lumotlar darhol direktor ekrani hamda foye monitoriga yetib boradi. Eng muhimi – internet bo'lmasa ham lokal tarmoqda 100% barqaror ishlayveradi.")

    # =================================================================
    # SLIDE 5: Modul 1 - Direktor Dashboard
    # =================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_transition(s5, "push", "l")
    add_slide_header(s5, "1-Asosiy Modul", "Direktor Dashboard: Maktab 360° Nazoratda", "Rahbariyat uchun qaror qabul qilishda real vaqtli analitika va markazlashgan boshqaruv", ACCENT_CYAN)

    add_card(s5, 0.8, 2.15, 5.6, 4.6, "Jonli Analitika va Statistika", [
        "Umumiy davomat foizi (masalan 95.4%) real vaqt rejimida har bir soniyada yangilanadi.",
        "Bugun kelganlar, kechikkanlar va darsga kelmaganlar soni aniq raqamlarda.",
        "O'qituvchilar va ma'muriyat xodimlarining ishga kelish tartibi monitoringi.",
        "Sinflar kesimidagi taqqoslash: qaysi sinfda eng namunali intizom borligi reytingi.",
        "Kechikuvchi va muntazam dars qoldiruvchi 'Xavf guruhi' ro'yxati alohida ko'rinadi."
    ], ACCENT_CYAN, "📊")

    add_card(s5, 6.8, 2.15, 5.7, 4.6, "Tezkor Boshqaruv va Eksport", [
        "Oylik va choraklik hisobotlarni bir tugma bilan rasmiy Excel formatida yuklab olish.",
        "Tuman va shahar Xalq Ta'limi Bo'limi talablariga mos tayyor jadvallar.",
        "Maktab qo'ng'iroq jadvallari, smenalar va dars vaqtlarini bir joydan sozlash.",
        "O'qituvchilar va xodimlarga rol va ruxsatlarni biriktirish (RBAC xavfsizlik).",
        "O'quvchilar va o'qituvchilar shaxsiy ma'lumotlarini qulay tahrirlash."
    ], ACCENT_GREEN, "📑")

    add_notes(s5, "Direktor Dashboardi rahbariyatning eng katta yordamchisidir. Direktor kabinetida o'tirib, maktabdagi barcha sinflarning davomatini, kechikkanlarni, o'qituvchilarning ishga kelganligini bir soniyada ko'radi. Qog'oz hisobotlar tayyorlashga endi soatlab vaqt ketmaydi – hamma narsa 1 ta klikda Excel formatida yuklanadi.")

    # =================================================================
    # SLIDE 6: Modul 2 - Jonli Foye Monitori (TV Display)
    # =================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_transition(s6, "push", "l")
    add_slide_header(s6, "2-Asosiy Modul", "Jonli Foye Monitori (Smart TV Tablosi)", "Maktab foyesidagi katta monitorlar orqali o'quvchilarni real-vaqtda kutib olish", ACCENT_PURPLE)

    # Left: Mockup of the TV screen
    tv_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.15), Inches(5.6), Inches(4.6))
    tv_box.fill.solid()
    tv_box.fill.fore_color.rgb = RGBColor(15, 23, 42)
    tv_box.line.color.rgb = ACCENT_PURPLE
    tv_box.line.width = Pt(2)

    tf_tv = tv_box.text_frame
    tf_tv.word_wrap = True
    tf_tv.margin_top = Inches(0.2)
    tf_tv.margin_left = Inches(0.25)
    tf_tv.margin_right = Inches(0.25)

    p_tv_h = tf_tv.paragraphs[0]
    p_tv_h.text = "🔴 LIVE MONITOR — PORT 5001"
    p_tv_h.font.size = Pt(13)
    p_tv_h.font.bold = True
    p_tv_h.font.color.rgb = ACCENT_ROSE
    p_tv_h.space_after = Pt(12)

    # Sample recognized items
    mock_students = [
        ("Sobirov Azizbek", "8-A Sinf • 1-Turniket", "KELDI 07:54", ACCENT_GREEN),
        ("Karimova Madina", "10-B Sinf • 2-Turniket", "KELDI 07:56", ACCENT_GREEN),
        ("Olimov Jasur", "11-A Sinf • 1-Turniket", "KECHIKDI 08:05", ACCENT_AMBER),
        ("Yo'ldoshev Davron", "9-V Sinf • 3-Turniket", "KELDI 08:02", ACCENT_GREEN),
    ]

    for name, sub, stat, col in mock_students:
        p_s = tf_tv.add_paragraph()
        p_s.text = f"👤  {name}  [{sub}]  ➔  {stat}"
        p_s.font.size = Pt(11)
        p_s.font.bold = True
        p_s.font.color.rgb = TEXT_WHITE
        p_s.space_after = Pt(8)

    # Biometric verification card (Privacy-safe abstract graphic, no real student photos)
    av_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.1), Inches(4.7), Inches(5.0), Inches(1.6))
    av_box.fill.solid()
    av_box.fill.fore_color.rgb = RGBColor(19, 31, 60)
    av_box.line.color.rgb = ACCENT_GREEN
    av_box.line.width = Pt(1.5)
    tf_avb = av_box.text_frame
    tf_avb.margin_top = Inches(0.2)
    tf_avb.margin_left = Inches(0.25)
    p_av0 = tf_avb.paragraphs[0]
    p_av0.text = "🛡️  BIOMETRIK XAVFSIZLIK VA SHAXSIY MA'LUMOTLAR HIMOYA QILINGAN"
    p_av0.font.size = Pt(10)
    p_av0.font.bold = True
    p_av0.font.color.rgb = ACCENT_GREEN
    p_av1 = tf_avb.add_paragraph()
    p_av1.text = "Yuz tasvirlari ochiq saqlanmaydi — 512 o'lchamli shifrlangan biometrik vektorga aylantiriladi. 0.3s tezlikda 99.8% aniqlik kafolatlangan."
    p_av1.font.size = Pt(9.5)
    p_av1.font.color.rgb = TEXT_WHITE

    # Right Card: Advantages of TV display
    add_card(s6, 6.8, 2.15, 5.7, 4.6, "Foye Tablosining Afzalliklari", [
        "Oddiy Smart TV yoki kompyuter monitori orqali brauzerda ochiladi: http://localhost:5001/monitor.",
        "Hech qanday qo'shimcha litsenziya yoki qimmatbaho dastur talab qilmaydi.",
        "Har bir o'quvchi o'z rasmi va ismini katta ekranda ko'rib, maktabga o'z vaqtida kelishga odatlanadi.",
        "Kechikkan o'quvchilar alohida ogohlantiruvchi sariq fonda ko'rinadi.",
        "Ota-onalar va tuman ta'lim inspeksiyasi uchun maktabning yuqori nufuzi va innovatsion darajasini ko'rsatadi.",
        "Kun davomida jami kelgan o'quvchilar sonining jonli hisoblagichi aks etib turadi."
    ], ACCENT_PURPLE, "✨")

    add_notes(s6, "Foye monitori – bu maktabga kirishdagi eng ko'rkam va ta'sirchan qismdir. O'quvchi darvozadan kirganda, katta ekranda uning rasmi va 'Xush kelibsiz' degan yozuv chiqadi. Kechikkan bo'lsa darhol seziladi. Bu esa o'quvchilarda intizomni o'z-o'zidan shakllantiradi.")

    # =================================================================
    # SLIDE 7: Modul 3 - Sinf Rahbari va O'qituvchi Jurnali
    # =================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_transition(s7, "push", "l")
    add_slide_header(s7, "3-Asosiy Modul", "Sinf Rahbari & Fan O'qituvchisi Kabineti", "Pedagoglar dars vaqtini faqat ta'limga sarflaydi, davomat esa avtomatik tayyor", ACCENT_AMBER)

    add_card(s7, 0.8, 2.15, 5.6, 4.6, "Sinf Rahbari Kabineti", [
        "1-dars boshlanishi bilanoq kim keldi, kim kechikdi va kim darsga kelmagani tayyor turadi.",
        "O'qituvchi 15 daqiqa dars vaqtini sarflab qo'lda yo'qlama qilmaydi.",
        "Kelmagan o'quvchilar uchun sababli/sababsiz belgilash va ma'lumotnoma (spravka) kiritish.",
        "Ota-onalarning telefon raqamlari har bir o'quvchi profilida tezkor chaqiruv uchun tayyor.",
        "Choraklik davomat varaqalarini 1 klikda chop etish va ota-onalar yig'ilishiga tahliliy hisobot tayyorlash."
    ], ACCENT_AMBER, "👨‍🏫")

    add_card(s7, 6.8, 2.15, 5.7, 4.6, "Fan O'qituvchisi Jurnali", [
        "Dars jadvali bilan to'liq integratsiya: o'qituvchi kirganda aynan hozirgi darsi va sinfi avtomatik ochiladi.",
        "Tezkor baholash tizimi: oraliq, formativ va umumiy ballarni kiritish.",
        "O'quvchining fan bo'yicha davomati va o'zlashtirishini o'zaro solishtirish imkoniyati.",
        "Mavzular taqvimi va uy vazifalarini tizimga biriktirish.",
        "Qog'oz jurnallarning yo'qolishi, yirtilishi yoki siyoh to'kilishi xavfidan butunlay xalos bo'lish."
    ], ACCENT_GREEN, "📚")

    add_notes(s7, "Sinf rahbarlari uchun bu katta yengillik. O'qituvchi darsga kirganida kim kelgani allaqachon ekranda tayyor bo'ladi. Sababli kelmaganlarga ma'lumotnoma biriktiriladi. Fan o'qituvchisi esa elektron jurnalda tezkor baho qo'yadi va mavzularni qayd etadi.")

    # =================================================================
    # SLIDE 8: Modul 4 - Excel Import va Sinf Ko'chirish
    # =================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_transition(s8, "push", "l")
    add_slide_header(s8, "4-Asosiy Modul", "Excel Integratsiya & Avtomatik Sinf Oshirish", "Minglab o'quvchilarni 1 daqiqada yuklash va yangi o'quv yiliga muammosiz o'tish", ACCENT_GREEN)

    add_card(s8, 0.8, 2.15, 3.65, 4.6, "Excel Ommaviy Import", [
        "Maktab o'quvchilari ro'yxatini Excel (.xlsx) fayldan bir lahzada tizimga yuklash.",
        "Ism, familiya, sinf, ota-ona telefoni va manzillarni avtomatik joylashtirish.",
        "Xatoliklarni tekshiruvchi aqlli import mexanizmi.",
        "Qo'lda bittalab yozib chiqishga ketadigan kunlab vaqtni tejash."
    ], ACCENT_GREEN, "📊")

    add_card(s8, 4.8, 2.15, 3.65, 4.6, "Yillik Sinf Ko'chirish (Promotion)", [
        "O'quv yili yakunlanganda barcha sinflarni avtomatik keyingi sinfga ko'chirish.",
        "1-A sinf avtomatik 2-A sinfga, 9-B esa 10-B ga o'tkaziladi.",
        "11-sinf bitiruvchilari avtomatik arxivlanadi va sertifikatlari saqlanadi.",
        "Yangi 1-sinflarni yangi o'quv yiliga tezkor biriktirish."
    ], ACCENT_CYAN, "🎓")

    add_card(s8, 8.8, 2.15, 3.7, 4.6, "Fotosuratlar va Face Baza", [
        "O'quvchilar rasmlarini zip-arxiv orqali ommaviy yuklash va Face-ID ga ulash.",
        "Yuzni tanish algoritmi har bir o'quvchining biometrik kodini xavfsiz saqlaydi.",
        "Maktab guvohnomasi va elektron profillar uchun tayyor fotobaza.",
        "Zaxira nusxalarni xavfsiz eksport qilish."
    ], ACCENT_PURPLE, "📸")

    add_notes(s8, "Maktab dasturini joriy qilishda eng katta qiyinchilik ma'lumotlarni kiritishdir. Bizning dasturimizda Excel orqali 1000 ta o'quvchini 1 daqiqada yuklash mumkin. Yil oxirida esa 'Promotion' tugmasi bosilsa, butun maktab sinflari avtomatik 1 sinf yuqoriga ko'tariladi.")

    # =================================================================
    # SLIDE 9: Xavfsizlik va Kiber-Himoya
    # =================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_transition(s9, "push", "l")
    add_slide_header(s9, "Kiberxavfsizlik", "Xavfsizlik, RBAC Ruxsatlar va Zaxiralash", "Shaxsiy ma'lumotlarni himoya qilish va uzluksiz tarmoq barqarorligi", ACCENT_BLUE)

    add_card(s9, 0.8, 2.15, 3.65, 4.6, "Rolli Ruxsatlar (RBAC)", [
        "Har bir xodim faqat o'ziga ruxsat berilgan bo'limlargagina kira oladi.",
        "Sinf rahbari faqat o'z sinfining ma'lumotlarini ko'radi va tahrirlaydi.",
        "Direktor va ma'muriyat butun maktab boshqaruv huquqiga ega.",
        "Ruxsatsiz kirish va ma'lumotlarni o'chirishga qat'iy cheklov o'rnatilgan."
    ], ACCENT_CYAN, "🔒")

    add_card(s9, 4.8, 2.15, 3.65, 4.6, "Lokal Rejimda Mustaqillik", [
        "Turniket va Face-ID kameralari maktabning ichki lokal tarmog'ida ishlaydi.",
        "Tashqi optik kabel uzilsa yoki provayderda nosozlik bo'lsa ham turniketlar to'xtamaydi.",
        "Node.js Ko'prik serveri (Port 5001) ma'lumotlarni xotirada saqlab turadi.",
        "Aloqa tiklanishi bilanoq bulutli bazaga ma'lumotlar avtomatik uzatiladi."
    ], ACCENT_GREEN, "🛡️")

    add_card(s9, 8.8, 2.15, 3.7, 4.6, "Biometrik Ma'lumotlar Himoyasi", [
        "O'quvchilarning yuz xarakteristikalari shifrlangan raqamli matritsa ko'rinishida saqlanadi.",
        "Begona shaxslar yoki xakerlar fotosuratlardan foydalana olmaydi.",
        "Har kuni avtomatik zaxira nusxalar (Cloud Backup) shakllantiriladi.",
        "O'zbekiston Respublikasi shaxsiy ma'lumotlar to'g'risidagi qonunchiligiga to'liq mos keladi."
    ], ACCENT_PURPLE, "🔐")

    add_notes(s9, "Xavfsizlik masalasi birinchi o'rinda. O'quvchilar va pedagoglarning shaxsiy ma'lumotlari to'liq shifrlangan. Internet uzilib qolsa ham maktab turniketi to'xtab qolmaydi, lokal tarmoqda 100% ishlashda davom etadi.")

    # =================================================================
    # SLIDE 10: Natijalar va Samaradorlik (ROI)
    # =================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_transition(s10, "push", "l")
    add_slide_header(s10, "Amaliy Samaradorlik", "Tizim Maktabga Nima Beradi? (ROI)", "Dastur joriy qilingandan keyingi aniq statistik ko'rsatkichlar", ACCENT_GREEN)

    metrics = [
        ("+25%", "Davomatning O'sishi", "Har bir o'quvchi kirish-chiqishi qat'iy qayd etilgani tufayli sababsiz dars qoldirishlar va kechikishlar 90% ga kamayadi.", ACCENT_GREEN),
        ("120+", "Soat Vaqt Tejaladi", "O'qituvchilar va ma'muriyatning yo'qlama qilish va oylik hisobot to'ldirishga ketadigan vaqti to'liq sof darsga yo'naltiriladi.", ACCENT_CYAN),
        ("80%", "Qog'oz Tejamkorligi", "Qog'oz jurnallar, davomat daftarlari va bosma blankalarga ketadigan xarajatlar deyarli butunlay qisqaradi.", ACCENT_AMBER),
        ("100%", "Ota-onalar Ishonchi", "Ota-ona farzandining maktabdaligidan ko'ngli to'q bo'ladi. Maktabning nufuzi, reytingi va obro'si keskin yuqorilaydi.", ACCENT_PURPLE)
    ]

    m_w = 2.7
    m_gap = 0.28
    m_x = 0.8
    for idx, (val, title, desc, col) in enumerate(metrics):
        x = m_x + idx * (m_w + m_gap)
        m_box = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(2.15), Inches(m_w), Inches(4.6))
        m_box.fill.solid()
        m_box.fill.fore_color.rgb = CARD_BG
        m_box.line.color.rgb = col
        m_box.line.width = Pt(1.5)

        tf_m = m_box.text_frame
        tf_m.word_wrap = True
        tf_m.margin_left = Inches(0.2)
        tf_m.margin_right = Inches(0.2)
        tf_m.margin_top = Inches(0.4)

        p_v = tf_m.paragraphs[0]
        p_v.text = val
        p_v.alignment = PP_ALIGN.CENTER
        p_v.font.name = "Segoe UI"
        p_v.font.size = Pt(36)
        p_v.font.bold = True
        p_v.font.color.rgb = col
        p_v.space_after = Pt(12)

        p_t = tf_m.add_paragraph()
        p_t.text = title
        p_t.alignment = PP_ALIGN.CENTER
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_after = Pt(14)

        p_d = tf_m.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_MUTED

    add_notes(s10, "Ushbu slayd loyihaning iqtisodiy va pedagogik samarasini ko'rsatadi: davomat kamida 25% ga yaxshilanadi, o'qituvchilar darsda yo'qlama o'rniga ta'lim sifatiga e'tibor beradi, qog'ozbozlik 80% ga kamayadi va maktabning nufuzi oshadi.")

    # =================================================================
    # SLIDE 11: Kelajakdagi Rivojlanish (Roadmap)
    # =================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_transition(s11, "push", "l")
    add_slide_header(s11, "Kelajak Rejalari", "Rivojlanish Yo'l Xaritasi (Roadmap)", "Tizimni yanada boyitish va kengaytirish bo'yicha keyingi bosqichlar", ACCENT_CYAN)

    add_card(s11, 0.8, 2.15, 3.65, 4.6, "1-Bosqich: Telegram Bot", [
        "Ota-onalar uchun avtomatlashtirilgan Telegram bot.",
        "Farzand maktabga kirishi bilan ota-ona telefoniga foto va vaqtli bildirishnoma.",
        "Kechikishlar va dars qoldirishlar haqida tezkor xabardor qilish.",
        "Oylik davomat reytingini ota-onaga jo'natish."
    ], ACCENT_CYAN, "🤖")

    add_card(s11, 4.8, 2.15, 3.65, 4.6, "2-Bosqich: Mobil Ilova", [
        "O'qituvchilar va direktor uchun maxsus iOS va Android mobil ilova.",
        "Har qanday joydan turib maktab holatini kuzatish.",
        "O'qituvchilar uchun qulay elektron jurnal va baholash interfeysi.",
        "Favqulodda xabarnomalarni bir lahzada butun maktabga tarqatish."
    ], ACCENT_GREEN, "📲")

    add_card(s11, 8.8, 2.15, 3.7, 4.6, "3-Bosqich: Oshxona & Kutubxona", [
        "Maktab oshxonasida 'Face-Pay' — yuz orqali naqd pulsiz to'lov tizimi.",
        "Kutubxonada kitob olish va topshirishni Face-ID orqali ro'yxatga olish.",
        "Sun'iy intellekt orqali o'quvchilar xatti-harakati va qobiliyatini tahlil qilish.",
        "Boshqa davlat ta'lim platformalari (Kundalik/e-Maktab) bilan to'liq integratsiya."
    ], ACCENT_PURPLE, "🚀")

    add_notes(s11, "Dasturimiz to'xtab qolmaydi: keyingi qadamda ota-onalar uchun Telegram bot, pedagoglar uchun mobil ilova va maktab oshxonasi hamda kutubxonasi bilan biometrik to'lov integratsiyasi amalga oshiriladi.")

    # =================================================================
    # SLIDE 12: Xulosa va Savol-Javoblar
    # =================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_transition(s12, "fade")

    final_card = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5))
    final_card.fill.solid()
    final_card.fill.fore_color.rgb = CARD_BG
    final_card.line.color.rgb = ACCENT_GREEN
    final_card.line.width = Pt(2)

    tf12 = final_card.text_frame
    tf12.word_wrap = True
    tf12.margin_top = Inches(0.7)

    p0 = tf12.paragraphs[0]
    p0.text = "✦  RAQAMLI KELAJAK SARI BIRGALIKDA  ✦"
    p0.alignment = PP_ALIGN.CENTER
    p0.font.name = "Segoe UI"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_GREEN
    p0.space_after = Pt(14)

    p1 = tf12.add_paragraph()
    p1.text = "E'tiboringiz Uchun Rahmat!"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(16)

    p2 = tf12.add_paragraph()
    p2.text = "Maktab CRM & Face-ID – Ta'limda tartib, xavfsizlik va yangi sifat bosqichi."
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(15)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_after = Pt(28)

    p3 = tf12.add_paragraph()
    p3.text = "Savol va takliflaringiz bo'lsa mamnuniyat bilan javob beramiz!"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(16)
    p3.font.bold = True
    p3.font.color.rgb = ACCENT_CYAN
    p3.space_after = Pt(22)

    # Demo Launch Info Box inside
    p4 = tf12.add_paragraph()
    p4.text = "💻  Tizimni hoziroq jonli sinab ko'rish: START_MAKTAB.bat  |  Foye Monitori: http://localhost:5001/monitor"
    p4.alignment = PP_ALIGN.CENTER
    p4.font.name = "Segoe UI"
    p4.font.size = Pt(11.5)
    p4.font.color.rgb = ACCENT_AMBER

    add_notes(s12, "Hurmatli tinglovchilar, e'tiboringiz uchun katta rahmat! Tizim allaqachon to'liq tayyorlangan va START_MAKTAB.bat orqali kompyuteringizda jonli ishlab turibdi. Endi savollaringiz va takliflaringiz bo'lsa, ularga javob berishga tayyormiz.")

    # Save
    out_file = os.path.join(os.getcwd(), "Maktab_CRM_Taqdimot.pptx")
    prs.save(out_file)
    print(f"PowerPoint fayli muvaffaqiyatli saqlandi: {out_file}")

if __name__ == "__main__":
    create_presentation()
