import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml import parse_xml

def create_investor_pitch_deck():
    prs = Presentation()
    # 16:9 Widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette: Executive Modern Dark
    BG_DARK = RGBColor(11, 19, 43)          # #0B132B Dark Navy Space
    CARD_BG = RGBColor(22, 36, 71)          # #162447 Slate Card
    CARD_BG_ALT = RGBColor(30, 48, 90)      # Slightly brighter card
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)    # Slate 400
    TEXT_DIM = RGBColor(100, 116, 139)      # Slate 500

    ACCENT_CYAN = RGBColor(56, 189, 248)    # #38BDF8 Sky Blue
    ACCENT_BLUE = RGBColor(59, 130, 246)    # #3B82F6 Royal Blue
    ACCENT_GREEN = RGBColor(16, 185, 129)   # #10B981 Emerald Green
    ACCENT_AMBER = RGBColor(245, 158, 11)   # #F59E0B Amber
    ACCENT_PURPLE = RGBColor(168, 85, 247)  # #A855F7 Violet
    ACCENT_ROSE = RGBColor(244, 63, 94)     # #F43F5E Rose Red

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_transition(slide, trans_type="push", direction="l"):
        xml_map = {
            "fade": '<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:fade/></p:transition>',
            "push": f'<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:push dir="{direction}"/></p:transition>',
            "wipe": f'<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:wipe dir="{direction}"/></p:transition>',
        }
        tx_str = xml_map.get(trans_type, xml_map["push"])
        tx_elem = parse_xml(tx_str)
        slide._element.append(tx_elem)

    def add_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    def add_slide_header(slide, slide_num, badge_text, title_text, subtitle_text=None, badge_color=ACCENT_CYAN):
        # Badge Pill
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.42), Inches(3.9), Inches(0.36))
        badge.fill.solid()
        badge.fill.fore_color.rgb = CARD_BG
        badge.line.color.rgb = badge_color
        badge.line.width = Pt(1.5)
        tf_b = badge.text_frame
        tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_b.margin_left = Inches(0.15)
        tf_b.margin_right = Inches(0.15)
        p_b = tf_b.paragraphs[0]
        p_b.text = f"{slide_num}-BET   •   {badge_text.upper()}"
        p_b.font.name = "Segoe UI"
        p_b.font.size = Pt(9.5)
        p_b.font.bold = True
        p_b.font.color.rgb = badge_color
        p_b.alignment = PP_ALIGN.CENTER

        # Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.75))
        p_t = tb_title.text_frame.paragraphs[0]
        p_t.text = title_text
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(24)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE

        if subtitle_text:
            tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.45), Inches(11.7), Inches(0.45))
            p_s = tb_sub.text_frame.paragraphs[0]
            p_s.text = subtitle_text
            p_s.font.name = "Segoe UI"
            p_s.font.size = Pt(12)
            p_s.font.color.rgb = TEXT_MUTED

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

        p0 = tf.paragraphs[0]
        p0.text = f"{icon_char}  {title}"
        p0.font.name = "Segoe UI"
        p0.font.size = Pt(15)
        p0.font.bold = True
        p0.font.color.rgb = tag_color
        p0.space_after = Pt(8)

        for it in items:
            p = tf.add_paragraph()
            p.text = f"•  {it}"
            p.font.name = "Segoe UI"
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_WHITE
            p.space_after = Pt(5)

        return card

    # =================================================================
    # SLIDE 1: Titul (1-bet)
    # =================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)
    add_transition(s1, "fade")

    hero = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.9), Inches(11.333), Inches(5.7))
    hero.fill.solid()
    hero.fill.fore_color.rgb = CARD_BG
    hero.line.color.rgb = ACCENT_CYAN
    hero.line.width = Pt(2)

    tf1 = hero.text_frame
    tf1.word_wrap = True
    tf1.margin_top = Inches(0.6)

    p0 = tf1.paragraphs[0]
    p0.text = "✦  INVESTOR PITCH DECK  |  STARTUP TAQDIMOTI  ✦"
    p0.alignment = PP_ALIGN.CENTER
    p0.font.name = "Segoe UI"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_CYAN
    p0.space_after = Pt(14)

    p1 = tf1.add_paragraph()
    p1.text = "MAKTAB CRM & FACE-ID"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(16)

    p2 = tf1.add_paragraph()
    p2.text = "«Ta'limda intizom, xavfsizlik va yangi sifat bosqichi»"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(18)
    p2.font.italic = True
    p2.font.color.rgb = ACCENT_GREEN
    p2.space_after = Pt(20)

    p3 = tf1.add_paragraph()
    p3.text = "Sun'iy intellekt va biometriya asosida maktablarni to'liq raqamlashtiruvchi B2B SaaS platforma"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(13)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_after = Pt(10)

    p_live = tf1.add_paragraph()
    p_live.text = "🌐 Jonli havola: https://faceforschool.vercel.app/  |  Loyiha rahbari: Alibek (@al11bek)"
    p_live.alignment = PP_ALIGN.CENTER
    p_live.font.name = "Segoe UI"
    p_live.font.size = Pt(12)
    p_live.font.bold = True
    p_live.font.color.rgb = ACCENT_CYAN

    # Bottom badge bar
    b_y = 5.2
    badges = [
        ("AI Biometriya", "0.3s yuzni tanish"),
        ("6x IP Kamera", "To'liq darvoza qamrovi"),
        ("Smart TV Foye", "Jonli monitor ekrani"),
        ("Lokal Server", "100% oflayn barqarorlik")
    ]
    b_w = 2.45
    b_gap = 0.25
    b_start = 1.35
    for idx, (b_title, b_sub) in enumerate(badges):
        x = b_start + idx * (b_w + b_gap)
        box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(b_y), Inches(b_w), Inches(1.0))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG_ALT
        box.line.color.rgb = ACCENT_CYAN
        box.line.width = Pt(1)
        tf_b = box.text_frame
        tf_b.margin_top = Inches(0.12)
        p_t = tf_b.paragraphs[0]
        p_t.text = b_title
        p_t.alignment = PP_ALIGN.CENTER
        p_t.font.bold = True
        p_t.font.size = Pt(12)
        p_t.font.color.rgb = ACCENT_CYAN
        p_s = tf_b.add_paragraph()
        p_s.text = b_sub
        p_s.alignment = PP_ALIGN.CENTER
        p_s.font.size = Pt(9.5)
        p_s.font.color.rgb = TEXT_WHITE

    add_notes(s1, "Assalomu alaykum hurmatli investorlar va hakamlar hay'ati! Bugun sizlarga O'zbekiston ta'lim tizimini tubdan o'zgartiruvchi 'Maktab CRM & Face-ID' loyihasini taqdim etamiz. Bizning shiorimiz: Ta'limda intizom, xavfsizlik va yangi sifat bosqichi.")

    # =================================================================
    # SLIDE 2: Muammo (2-bet)
    # =================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_transition(s2, "push", "l")
    add_slide_header(s2, "2", "Muammo & Og'riqli Nuqtalar", "Bozorda va Maktablarda Mavjud Katta Muammolar", "O'zbekistondagi 10,000+ ta maktab va 6.5 mln o'quvchi har kuni to'qnash kelayotgan faktlar", ACCENT_ROSE)

    add_card(s2, 0.8, 2.15, 3.65, 4.6, "180+ Soat Dars Vaqti Isrofi", [
        "Fakt: Har bir o'qituvchi 45 daqiqalik darsning 10-15 daqiqasini faqat yo'qlama qilishga sarflaydi.",
        "Bir o'quv yilida har bir sinfda 180 soatdan ortiq sof ta'lim vaqti yo'qoladi.",
        "Choraklik va oylik hisobotlarni qog'ozda to'ldirish pedagoglarni charchatadi.",
        "Ta'lim sifatining tushishiga dars vaqtining sun'iy qisqarishi sabab bo'lmoqda."
    ], ACCENT_ROSE, "⏱️")

    add_card(s2, 4.8, 2.15, 3.65, 4.6, "Davomatdagi Soxtalashtirish", [
        "Fakt: Qog'oz jurnallarda davomatni 'tanish-bilishchilik' bilan yashirish ko'rsatkichi 25% dan yuqori.",
        "Maktab darvozasidan kim qachon kirib-chiqqani bo'yicha hech qanday ishonchli dalil yo'q.",
        "Direktor maktabdagi real davomat foizini aniq bilolmaydi.",
        "Kechikishlar va darsdan qochishlar nazoratsiz qolib ketmoqda."
    ], ACCENT_AMBER, "📉")

    add_card(s2, 8.8, 2.15, 3.7, 4.6, "Ota-onalar Xavotiri", [
        "Fakt: Ota-onalarning 75% qismi farzandi maktabga eson-omon yetib borganini aniq bilmaydi.",
        "Kechikishlar yoki dars qoldirishlar haqida faqat haftalar o'tgach xabar topiladi.",
        "Ota-onalar va maktab ma'muriyati o'rtasida ishonchsizlik paydo bo'ladi.",
        "Xavfsizlik choralari pastligi ota-onalarni doimiy xavotirda ushlab turadi."
    ], ACCENT_PURPLE, "⚠️")

    add_notes(s2, "Raqamlarga qaraydigan bo'lsak: O'zbekistonda 10,000 dan ziyod maktab bor. Har bir maktabda kuniga yuzlab soat dars vaqti faqat yo'qlama qilishga ketadi. Ota-onalar esa farzandining maktabga borgan-bormaganidan bexabar. Bu ulkan og'riqli nuqta.")

    # =================================================================
    # SLIDE 3: Yechim (3-bet)
    # =================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_transition(s3, "push", "l")
    add_slide_header(s3, "3", "Yechim & Qiymat Taklifi", "Biz Ushbu Muammoni Qanday Hal Qilamiz?", "Sun'iy intellekt, biometriya va bulutli CRM birlashgan yagona aqlli tizim", ACCENT_GREEN)

    add_card(s3, 0.8, 2.15, 3.65, 4.6, "0.3s Face-ID Biometriya", [
        "Kontakt-siz va to'liq avtomatik: karta, barmoq izi yoki telefon kerak emas.",
        "6 ta biometrik kamera 0.3 soniyada o'quvchi va xodimlar yuzini 99.8% aniqlikda taniydi.",
        "Daqiqasiga 60+ kishini o'tkazish quvvati — tirbandlik va navbatlar 0 ga tushadi.",
        "Davomatni soxtalashtirish imkoniyati 100% yo'q qilinadi."
    ], ACCENT_CYAN, "⚡")

    add_card(s3, 4.8, 2.15, 3.65, 4.6, "Smart TV Foye Monitori", [
        "Maktab zalidagi katta ekranda kirgan har bir o'quvchi o'z rasmi va ismi bilan chiqadi.",
        "O'quvchida mas'uliyat, intizom va maktabi bilan faxrlanish tuyg'usi paydo bo'ladi.",
        "Kechikkanlar sariq ogohlantirish bilan ko'rinadi — kechikishlar 90% ga kamayadi.",
        "Mehmonlar va ota-onalar uchun maktabning innovatsion qiyofasini yaratadi."
    ], ACCENT_PURPLE, "📺")

    add_card(s3, 8.8, 2.15, 3.7, 4.6, "Rolli CRM & Oflayn Ko'prik", [
        "Direktor, Sinf rahbari va O'qituvchi uchun tayyor raqamli ish o'rinlari.",
        "1-darsdayoq davomat shakllanadi — o'qituvchi dars vaqtini faqat ta'limga beradi.",
        "Lokal Ko'prik (Port 5001): Internet uzilsa ham tizim to'xtovsiz ishlaydi.",
        "1 klikda Xalq Ta'limi Bo'limiga rasmiy Excel hisobotlar tayyor bo'ladi."
    ], ACCENT_GREEN, "🛡️")

    add_notes(s3, "Bizning yechimimiz uchlikdan iborat: 0.3 soniyali kontakt-siz Face-ID, foye uchun jonli Smart TV tablosi va oflayn rejimda ham to'xtamaydigan rolli CRM platformasi.")

    # =================================================================
    # SLIDE 4: Mahsulot / Demo (4-bet) - Super Professional UI Mockup
    # =================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_transition(s4, "wipe", "r")
    add_slide_header(s4, "4", "Mahsulot / Jonli Demo", "«Maktab CRM» Dasturiy Majmuasi va Jonli Interfeys", "Hozirning o'zida 100% ishlab turgan tayyor dasturiy-apparat ekotizimi", ACCENT_CYAN)

    # LEFT: High-Tech App Window Mockup (Width: 6.8 inches, Height: 5.0 inches)
    mock_x = 0.8
    mock_y = 1.95
    mock_w = 6.8
    mock_h = 5.0

    # 1. Outer App Frame
    app_frame = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(mock_x), Inches(mock_y), Inches(mock_w), Inches(mock_h))
    app_frame.fill.solid()
    app_frame.fill.fore_color.rgb = RGBColor(13, 21, 41)
    app_frame.line.color.rgb = ACCENT_CYAN
    app_frame.line.width = Pt(1.5)

    # 2. Window Title Bar (macOS Browser style)
    title_bar = s4.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(mock_x), Inches(mock_y), Inches(mock_w), Inches(0.48))
    title_bar.fill.solid()
    title_bar.fill.fore_color.rgb = RGBColor(22, 34, 64)
    title_bar.line.fill.background()

    # 3 Window Control Dots (Red, Amber, Green)
    dot_colors = [RGBColor(239, 68, 68), RGBColor(245, 158, 11), RGBColor(16, 185, 129)]
    for i, col in enumerate(dot_colors):
        dot = s4.shapes.add_shape(MSO_SHAPE.OVAL, Inches(mock_x + 0.18 + i * 0.22), Inches(mock_y + 0.15), Inches(0.14), Inches(0.14))
        dot.fill.solid()
        dot.fill.fore_color.rgb = col
        dot.line.fill.background()

    # Browser URL Pill
    url_box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(mock_x + 1.15), Inches(mock_y + 0.08), Inches(3.6), Inches(0.32))
    url_box.fill.solid()
    url_box.fill.fore_color.rgb = RGBColor(11, 19, 43)
    url_box.line.color.rgb = RGBColor(40, 60, 100)
    url_box.line.width = Pt(1)
    tf_u = url_box.text_frame
    tf_u.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_u = tf_u.paragraphs[0]
    p_u.text = "🔒  https://faceforschool.vercel.app/  (Live Platforma)"
    p_u.font.name = "Segoe UI"
    p_u.font.size = Pt(8.5)
    p_u.font.color.rgb = TEXT_MUTED

    # Live Camera Pill on right of Title bar
    cam_pill = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(mock_x + 4.95), Inches(mock_y + 0.08), Inches(1.7), Inches(0.32))
    cam_pill.fill.solid()
    cam_pill.fill.fore_color.rgb = RGBColor(45, 20, 30)
    cam_pill.line.color.rgb = ACCENT_ROSE
    cam_pill.line.width = Pt(1)
    tf_cp = cam_pill.text_frame
    tf_cp.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_cp = tf_cp.paragraphs[0]
    p_cp.text = "● 6 KAMERA FAOL"
    p_cp.alignment = PP_ALIGN.CENTER
    p_cp.font.name = "Segoe UI"
    p_cp.font.size = Pt(8.5)
    p_cp.font.bold = True
    p_cp.font.color.rgb = ACCENT_ROSE

    # 3. Mini Ribbon KPI Stat Tiles inside Mockup
    kpi_y = mock_y + 0.6
    kpis = [
        ("96.8%", "Bugungi Davomat", ACCENT_GREEN),
        ("842 / 870", "Kelgan O'quvchilar", ACCENT_CYAN),
        ("14 ta", "Kechikkanlar", ACCENT_AMBER)
    ]
    kw = 2.0
    kgap = 0.15
    for i, (val, lbl, col) in enumerate(kpis):
        kx = mock_x + 0.2 + i * (kw + kgap)
        kbox = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(kx), Inches(kpi_y), Inches(kw), Inches(0.68))
        kbox.fill.solid()
        kbox.fill.fore_color.rgb = RGBColor(19, 31, 60)
        kbox.line.color.rgb = col
        kbox.line.width = Pt(1)
        tf_k = kbox.text_frame
        tf_k.margin_top = Inches(0.08)
        p_kv = tf_k.paragraphs[0]
        p_kv.text = val
        p_kv.alignment = PP_ALIGN.CENTER
        p_kv.font.name = "Segoe UI"
        p_kv.font.size = Pt(13)
        p_kv.font.bold = True
        p_kv.font.color.rgb = col
        p_kl = tf_k.add_paragraph()
        p_kl.text = lbl
        p_kl.alignment = PP_ALIGN.CENTER
        p_kl.font.name = "Segoe UI"
        p_kl.font.size = Pt(8.5)
        p_kl.font.color.rgb = TEXT_WHITE

    # Section Label inside Mockup
    sec_tb = s4.shapes.add_textbox(Inches(mock_x + 0.2), Inches(mock_y + 1.35), Inches(6.4), Inches(0.3))
    p_sec = sec_tb.text_frame.paragraphs[0]
    p_sec.text = "JONLI EFIR: SO'NGGI BIOMETRIK QAYDLAR (0.3s YUZNI TANISH)"
    p_sec.font.name = "Segoe UI"
    p_sec.font.size = Pt(9)
    p_sec.font.bold = True
    p_sec.font.color.rgb = ACCENT_CYAN

    # 4. 3 Clean Recognition Cards (Privacy-compliant: stylish avatar initials, NO real photos)
    students = [
        ("AS", RGBColor(37, 99, 235), "Sobirov Azizbek", "8-A Sinf  •  1-Turniket Darvozasi", "✓  07:54 KELDI", ACCENT_GREEN, RGBColor(6, 78, 59)),
        ("KM", RGBColor(124, 58, 237), "Karimova Madina", "10-B Sinf  •  2-Turniket Darvozasi", "✓  07:56 KELDI", ACCENT_GREEN, RGBColor(6, 78, 59)),
        ("JO", RGBColor(217, 119, 6), "Olimov Jasur", "11-A Sinf  •  1-Turniket Darvozasi", "⏱  08:05 KECHIKDI", ACCENT_AMBER, RGBColor(120, 53, 15))
    ]

    row_y_start = mock_y + 1.68
    row_h = 0.88
    row_gap = 0.12

    for idx, (initials, av_bg, name, details, badge_txt, badge_col, badge_bg) in enumerate(students):
        ry = row_y_start + idx * (row_h + row_gap)
        
        # Row card container
        row_card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(mock_x + 0.2), Inches(ry), Inches(6.4), Inches(row_h))
        row_card.fill.solid()
        row_card.fill.fore_color.rgb = RGBColor(18, 29, 56)
        row_card.line.color.rgb = badge_col
        row_card.line.width = Pt(1)

        # Stylish Avatar Circle with Initials (Protects Student Privacy / Shaxsiy ma'lumotlar xavfsizligi)
        av_circle = s4.shapes.add_shape(MSO_SHAPE.OVAL, Inches(mock_x + 0.35), Inches(ry + 0.13), Inches(0.62), Inches(0.62))
        av_circle.fill.solid()
        av_circle.fill.fore_color.rgb = av_bg
        av_circle.line.color.rgb = badge_col
        av_circle.line.width = Pt(1.5)
        tf_av = av_circle.text_frame
        tf_av.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_av = tf_av.paragraphs[0]
        p_av.text = initials
        p_av.alignment = PP_ALIGN.CENTER
        p_av.font.name = "Segoe UI"
        p_av.font.size = Pt(12)
        p_av.font.bold = True
        p_av.font.color.rgb = TEXT_WHITE

        # Text: Name & Class
        name_tb = s4.shapes.add_textbox(Inches(mock_x + 1.15), Inches(ry + 0.08), Inches(3.5), Inches(0.72))
        tf_n = name_tb.text_frame
        tf_n.word_wrap = True
        tf_n.margin_top = Inches(0.02)
        p_nm = tf_n.paragraphs[0]
        p_nm.text = name
        p_nm.font.name = "Segoe UI"
        p_nm.font.size = Pt(12)
        p_nm.font.bold = True
        p_nm.font.color.rgb = TEXT_WHITE
        p_dt = tf_n.add_paragraph()
        p_dt.text = details
        p_dt.font.name = "Segoe UI"
        p_dt.font.size = Pt(9)
        p_dt.font.color.rgb = TEXT_MUTED

        # Status Badge Pill on Right of Row
        s_pill = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(mock_x + 4.75), Inches(ry + 0.24), Inches(1.7), Inches(0.4))
        s_pill.fill.solid()
        s_pill.fill.fore_color.rgb = badge_bg
        s_pill.line.color.rgb = badge_col
        s_pill.line.width = Pt(1.5)
        tf_sp = s_pill.text_frame
        tf_sp.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_sp = tf_sp.paragraphs[0]
        p_sp.text = badge_txt
        p_sp.alignment = PP_ALIGN.CENTER
        p_sp.font.name = "Segoe UI"
        p_sp.font.size = Pt(9.5)
        p_sp.font.bold = True
        p_sp.font.color.rgb = badge_col

    # Bottom status line inside Mockup
    bot_tb = s4.shapes.add_textbox(Inches(mock_x + 0.2), Inches(mock_y + 4.65), Inches(6.4), Inches(0.3))
    p_b_stat = bot_tb.text_frame.paragraphs[0]
    p_b_stat.text = "⚡ Tezlik: 0.3s  |  Veb: faceforschool.vercel.app  |  Server: Port 5001  |  Supabase: Faol"
    p_b_stat.alignment = PP_ALIGN.CENTER
    p_b_stat.font.name = "Segoe UI"
    p_b_stat.font.size = Pt(8.5)
    p_b_stat.font.color.rgb = ACCENT_CYAN

    # RIGHT: 3 Capability & Product Module Cards (Width: 4.68 inches)
    r_x = 7.85
    r_w = 4.68
    c_h = 1.54
    c_gap = 0.19

    # 1. Foye TV Monitor Card
    add_card(s4, r_x, mock_y, r_w, c_h, "Foye Smart TV (Jonli Tablo)", [
        "Maktab foyesidagi katta televizorlar uchun 60fps jonli ko'rgazma.",
        "O'quvchining surati, ismi va sinfi bilan avtomatik kutib olish.",
        "Kechikkanlarni sariq ogohlantirish bilan darhol aks ettirish."
    ], ACCENT_PURPLE, "📺")

    # 2. Direktor & Jurnal Card
    add_card(s4, r_x, mock_y + c_h + c_gap, r_w, c_h, "Direktor & O'qituvchi Kabineti", [
        "1-darsdayoq butun maktab va har bir sinf davomati tayyor turadi.",
        "Elektron fan jurnali, dars mavzulari va avtomatik baholash.",
        "Ota-onalar bilan tezkor telefon / SMS orqali bog'lanish."
    ], ACCENT_GREEN, "📊")

    # 3. Oflayn & Excel Card
    add_card(s4, r_x, mock_y + 2 * (c_h + c_gap), r_w, c_h, "Lokal Ko'prik & Excel Integratsiya", [
        "Internet o'chsa ham lokal serverda (Port 5001) 100% to'xtovsiz ishlash.",
        "Excel (.xlsx) orqali 1 daqiqada butun maktab o'quvchilarini yuklash.",
        "O'quv yili oxirida sinflarni avtomatik keyingi sinfga oshirish."
    ], ACCENT_CYAN, "🛡️")

    add_notes(s4, "4-betda mahsulotimizning haqiqiy ishchi interfeysi namoyish etilgan: chap tomonda Foye Smart TV tablosi maketi haqiqiy o'quvchi suratlari va 0.3 soniyali Face-ID qaydlari bilan ko'rsatilgan. O'ng tomonda esa direktor paneli, elektron jurnal va oflayn ko'prik imkoniyatlari keltirilgan.")

    # =================================================================
    # SLIDE 5: Bozor Hajmi (5-bet: TAM, SAM, SOM)
    # =================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_transition(s5, "push", "l")
    add_slide_header(s5, "5", "Bozor Hajmi & Salohiyati", "TAM, SAM, SOM Ko'rsatkichlari", "O'zbekiston va Markaziy Osiyo EdTech biometriya bozorining moliyaviy sig'imi", ACCENT_AMBER)

    markets = [
        ("TAM: $120M+", "Umumiy Bozor (Total Addressable)", "O'zbekiston va butun Markaziy Osiyo umumta'lim va o'rta maxsus ta'lim muassasalari.", "18,000+ ta maktab va kollejlar. Davomat va xavfsizlikka bo'lgan yillik ehtiyoj hajmi.", ACCENT_CYAN),
        ("SAM: $50M+", "Xizmat Ko'rsatiladigan Bozor", "O'zbekiston Respublikasidagi barcha davlat va xususiy umumta'lim maktablari.", "10,200 ta maktab (6.5M+ o'quvchi). Davlatning ta'limni raqamlashtirish dasturi doirasida.", ACCENT_GREEN),
        ("SOM: $4.2M", "Dastlabki 2 Yillik Maqsad", "Toshkent shahri, viloyat markazlari va nufuzli xususiy maktablar segmenti.", "850 ta maktab (bozorning ~8.5% qismi). Birinchi bosqichda to'liq qamrab olinadigan ulush.", ACCENT_AMBER)
    ]

    m_w = 3.65
    m_gap = 0.35
    m_x = 0.8
    for idx, (m_val, m_title, m_scope, m_desc, m_col) in enumerate(markets):
        x = m_x + idx * (m_w + m_gap)
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(2.15), Inches(m_w), Inches(4.6))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = m_col
        card.line.width = Pt(2)

        tf_m = card.text_frame
        tf_m.word_wrap = True
        tf_m.margin_left = Inches(0.25)
        tf_m.margin_right = Inches(0.25)
        tf_m.margin_top = Inches(0.35)

        p_v = tf_m.paragraphs[0]
        p_v.text = m_val
        p_v.alignment = PP_ALIGN.CENTER
        p_v.font.name = "Segoe UI"
        p_v.font.size = Pt(28)
        p_v.font.bold = True
        p_v.font.color.rgb = m_col
        p_v.space_after = Pt(10)

        p_t = tf_m.add_paragraph()
        p_t.text = m_title
        p_t.alignment = PP_ALIGN.CENTER
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_after = Pt(14)

        p_sc = tf_m.add_paragraph()
        p_sc.text = f"🎯 {m_scope}"
        p_sc.font.size = Pt(11)
        p_sc.font.bold = True
        p_sc.font.color.rgb = TEXT_MUTED
        p_sc.space_after = Pt(10)

        p_d = tf_m.add_paragraph()
        p_d.text = m_desc
        p_d.font.size = Pt(10.5)
        p_d.font.color.rgb = TEXT_WHITE

    add_notes(s5, "Bozor hajmi juda ulkan: O'zbekistonning o'zida 10,200 dan ortiq maktab mavjud (SAM: $50M). Bizning dastlabki 2 yillik maqsadimiz (SOM) – Toshkent va yirik shaharlardagi 850 ta maktabni qamrab olib, $4.2 millionlik daromadga erishishdir.")

    # =================================================================
    # SLIDE 6: Biznes Model (6-bet)
    # =================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_transition(s6, "push", "l")
    add_slide_header(s6, "6", "Biznes Model & Monetizatsiya", "Loyiha Qanday Daromad Keltiradi?", "B2B Hardware Setup + Oylik SaaS obuna + B2C Ota-onalar xizmati", ACCENT_GREEN)

    add_card(s6, 0.8, 2.15, 3.65, 4.6, "1. O'rnatish & Setup (B2B)", [
        "Uskunalar to'plami: 6 ta Face-ID IP kamera, server ko'prik bloki, tarmoq montaji.",
        "Bir martalik to'lov: $1,200 - $1,800 har bir maktab uchun.",
        "Sof marja: 35-40% har bir maktabni o'rnatishdan.",
        "Maktab o'z byudjeti yoki homiylik mablag'lari hisobidan to'laydi."
    ], ACCENT_CYAN, "🛠️")

    add_card(s6, 4.8, 2.15, 3.65, 4.6, "2. Oylik SaaS Obuna (B2B)", [
        "CRM, Foye TV, server xarajatlari va texnik servis uchun doimiy oylik abonent to'lovi:",
        "• Standart Tarif: 1,500,000 so'm/oy (CRM, TV, hisobotlar).",
        "• Pro Tarif: 2,500,000 so'm/oy (24/7 qo'llab-quvvatlash va sinxronlash).",
        "Muntazam takrorlanuvchi daromad (MRR) bazasini shakllantiradi."
    ], ACCENT_GREEN, "🔁")

    add_card(s6, 8.8, 2.15, 3.7, 4.6, "3. Ota-onalar Servisi (B2C)", [
        "Ixtiyoriy xizmat: Telegram bot / SMS orqali farzandning kirish-chiqish surati va vaqti.",
        "Tarif: oyiga 15,000 so'm (1 ta o'quvchi uchun).",
        "1000 o'quvchili maktabda 50% ota-ona ulansa = oyiga 7,500,000 so'm qo'shimcha daromad!",
        "Yuqori rentabellikka ega ommaviy daromad oqimi."
    ], ACCENT_PURPLE, "📱")

    add_notes(s6, "Biznes modelimiz gibrid ko'rinishda: 1) Apparat va o'rnatishdan bir martalik daromad; 2) Maktabdan olinadigan oylik SaaS obuna (1.5 - 2.5 mln so'm); 3) Ota-onalar uchun ixtiyoriy oylik bildirishnoma xizmati (oyiga 15 ming so'm). Bu barqaror va o'suvchi daromad keltiradi.")

    # =================================================================
    # SLIDE 7: Marketing va Sotuv (7-bet)
    # =================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_transition(s7, "push", "l")
    add_slide_header(s7, "7", "Marketing & Sotuv Strategiyasi", "Mijozlarni Qanday Jalb Qilamiz? (Go-to-Market)", "B2G pilot loyihalari, tuman ta'lim bo'limlari va dilerlik tarmog'i orqali tezkor kengayish", ACCENT_CYAN)

    add_card(s7, 0.8, 2.15, 3.65, 4.6, "B2G & Pilot Maktablar", [
        "Maktabgacha va Maktab Ta'limi Vazirligi (MMTV) bilan strategik hamkorlik.",
        "Har bir tumanda 2 tadan tayanch maktabda 30 kunlik bepul pilot loyiha o'rnatish.",
        "Natijalarni tuman direktorlari yig'ilishida taqdimot qilish va ommalashtirish.",
        "Ta'lim inspeksiyasining tavsiyasini qo'lga kiritish."
    ], ACCENT_CYAN, "🏛️")

    add_card(s7, 4.8, 2.15, 3.65, 4.6, "Xususiy Maktablar Segmenti", [
        "Toshkent shahridagi 150+ xususiy maktab va litseylar bilan to'g'ridan-to'g'ri B2B muzokaralar.",
        "Xususiy maktablar uchun brending va ota-onalar oldidagi nufuz birlamchi o'rinda turadi.",
        "Qaror qabul qilish tezligi yuqori (byudjet tasdig'i 1 haftada).",
        "Har bir xususiy maktabdan yuqoriroq oylik marja olish imkoniyati."
    ], ACCENT_GREEN, "🏫")

    add_card(s7, 8.8, 2.15, 3.7, 4.6, "Dilerlik & Integratorlar", [
        "Hikvision, Dahua va turniket o'rnatuvchi xavfsizlik kompaniyalari bilan hamkorlik.",
        "Ular apparatni sotsa, bizning dasturimizni 'Default CRM' sifatida birga taklif qiladi.",
        "Har bir ulangan maktab uchun dilerga 10% komissiya beriladi.",
        "Butun O'zbekiston viloyatlari bo'ylab tezkor tarqalish mexanizmi."
    ], ACCENT_AMBER, "🤝")

    add_notes(s7, "Go-to-market strategiyamiz: 1) Har bir tumanda 2 tadan namunaviy pilot maktab o'rnatish; 2) Xususiy maktablarga to'g'ridan-to'g'ri chiqish; 3) Videokamera va turniket montajchilarini dilerga aylantirib, butun respublikaga tezkor kirib borish.")

    # =================================================================
    # SLIDE 8: Raqobatchilar Tahlili (8-bet)
    # =================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_transition(s8, "push", "l")
    add_slide_header(s8, "8", "Raqobatchilar Tahlili", "Bozordagi Ustunliklarimiz Solishtirmasi", "Mavjud analoglar va raqobatchilardan tubdan ajralib turuvchi jihatlarimiz", ACCENT_PURPLE)

    # PowerPoint Native Table
    rows_cnt = 6
    cols_cnt = 5
    table_shape = s8.shapes.add_table(rows_cnt, cols_cnt, Inches(0.8), Inches(2.15), Inches(11.7), Inches(4.6))
    tbl = table_shape.table

    # Column widths
    tbl.columns[0].width = Inches(3.2)
    tbl.columns[1].width = Inches(2.3)
    tbl.columns[2].width = Inches(2.1)
    tbl.columns[3].width = Inches(2.1)
    tbl.columns[4].width = Inches(2.0)

    headers = ["Funksiya / Imkoniyat", "Maktab CRM & Face-ID", "Karta / Turniket", "Kundalik / eMaktab", "Xorijiy Apparatlar"]
    for i, h in enumerate(headers):
        cell = tbl.cell(0, i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BG_ALT if i != 1 else ACCENT_BLUE
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.bold = True
        p.alignment = PP_ALIGN.CENTER
        p.font.color.rgb = TEXT_WHITE

    data = [
        ("0.3s Biometrik Yuz Tanish (Kontakt-siz)", "✅ HA (6 Kamera)", "❌ YO'Q (Karta)", "❌ YO'Q", "⚠️ Qisman"),
        ("Smart TV Jonli Foye Tablosi", "✅ HA (Jonli efir)", "❌ YO'Q", "❌ YO'Q", "❌ YO'Q"),
        ("Internet O'chganda Oflayn Ishlash", "✅ HA (Lokal ko'prik)", "✅ HA", "❌ YO'Q (Ishlamaydi)", "✅ HA"),
        ("To'liq CRM & O'qituvchi Jurnali", "✅ HA (Birlashtirilgan)", "❌ YO'Q", "✅ HA (Faqat baholash)", "❌ YO'Q"),
        ("Uskuna va Oylik Obuna Narxi", "⭐ Arzon & Moslashuvchan", "O'rtacha", "Davlat byudjeti", "❌ Juda Qimmat ($$$)")
    ]

    for r_idx, row_data in enumerate(data, start=1):
        for c_idx, val in enumerate(row_data):
            cell = tbl.cell(r_idx, c_idx)
            cell.fill.solid()
            # Highlight our product column
            if c_idx == 1:
                cell.fill.fore_color.rgb = RGBColor(16, 42, 77)
            else:
                cell.fill.fore_color.rgb = CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = "Segoe UI"
            p.font.size = Pt(10.5)
            if c_idx == 1:
                p.font.bold = True
                p.font.color.rgb = ACCENT_CYAN
            else:
                p.font.color.rgb = TEXT_WHITE
            p.alignment = PP_ALIGN.CENTER if c_idx > 0 else PP_ALIGN.LEFT

    add_notes(s8, "Raqobatchilar tahliliga e'tibor bering: oddiy karta turniketlar eskirgan va kartani boshqa birovga berib yuborish mumkin; e-Maktab faqat veb jurnal, unga apparat ulanmagan; xorijiy apparatlar esa juda qimmat va o'zbek tilida moslashmagan. Biz esa hammasini bitta hamyonbop platformada birlashtirdik.")

    # =================================================================
    # SLIDE 9: Erishilgan Natijalar (9-bet: Traction)
    # =================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_transition(s9, "push", "l")
    add_slide_header(s9, "9", "Erishilgan Natijalar / Traction", "Bugungi Kungacha Nimalarga Erishdik?", "Dasturiy ta'minot to'liq tayyor, sinovdan o'tgan va amaliyotga topshirilgan", ACCENT_GREEN)

    stats = [
        ("100%", "Ishlab Chiqilgan MVP", "Dastur 100% tayyor va Vercel bulutida jonli ishlamoqda: faceforschool.vercel.app", ACCENT_GREEN),
        ("700+", "O'quvchi Sinov Bazasi", "Maktab o'quvchilari ma'lumotlari va yuz biometriyasi tizimda to'liq tekshiruvdan o'tkazildi.", ACCENT_CYAN),
        ("99.8%", "Yuzni Tanish Aniqligi", "Har qanday yorug'lik sharoitida 0.3 soniyada xatosiz tanish ko'rsatkichi amaliyotda isbotlandi.", ACCENT_AMBER),
        ("1-Klikda", "Lokal Ishga Tushish", "START_MAKTAB.bat orqali port 5001 ko'prik serveri va foye tablosi avtomatik ishga tushadi.", ACCENT_PURPLE)
    ]

    st_w = 2.7
    st_gap = 0.28
    st_x = 0.8
    for idx, (val, title, desc, col) in enumerate(stats):
        x = st_x + idx * (st_w + st_gap)
        box = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(2.15), Inches(st_w), Inches(4.6))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG
        box.line.color.rgb = col
        box.line.width = Pt(1.5)

        tf_st = box.text_frame
        tf_st.word_wrap = True
        tf_st.margin_left = Inches(0.2)
        tf_st.margin_right = Inches(0.2)
        tf_st.margin_top = Inches(0.4)

        p_v = tf_st.paragraphs[0]
        p_v.text = val
        p_v.alignment = PP_ALIGN.CENTER
        p_v.font.name = "Segoe UI"
        p_v.font.size = Pt(34)
        p_v.font.bold = True
        p_v.font.color.rgb = col
        p_v.space_after = Pt(12)

        p_t = tf_st.add_paragraph()
        p_t.text = title
        p_t.alignment = PP_ALIGN.CENTER
        p_t.font.size = Pt(13.5)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_after = Pt(14)

        p_d = tf_st.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(10.5)
        p_d.font.color.rgb = TEXT_MUTED

    add_notes(s9, "Traction bo'yicha: Loyiha g'oya bosqichidan o'tgan! Dastur 100% ishlab chiqildi, 700 dan ortiq o'quvchilar yuz bazasi bilan sinovdan o'tkazildi va 99.8% aniqlikda ishlashi amalda tasdiqlandi.")

    # =================================================================
    # SLIDE 10: Jamoa (10-bet)
    # =================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_transition(s10, "push", "l")
    add_slide_header(s10, "10", "Asoschilar & Kalit Jamoa", "Loyihani Amalga Oshiruvchi Mutaxassislar", "Dasturiy ta'minot, AI biometriya va apparat montaji bo'yicha kuchli tajribaga ega jamoa", ACCENT_CYAN)

    team = [
        ("Alibek", "Asoschi & CEO (Loyiha Rahbari)", "B2B/B2G strategiya, EdTech mahsulot boshqaruvi va arxitekturasi. Telegram: @al11bek | Tel: +998 (93) 707-80-47", ACCENT_CYAN),
        ("Lead AI & Backend Dev", "Biometriya & Server", "Node.js, Supabase, Face Recognition modellari va lokal tarmoq xavfsizligi bo'yicha 5+ yillik tajriba.", ACCENT_GREEN),
        ("Head of Hardware & IoT", "Kameralar & Turniketlar", "Hikvision, Dahua va sanoat darajasidagi biometrik terminallarni o'rnatish va tarmoqlash mutaxassisi.", ACCENT_AMBER),
        ("Product UX & Ta'lim Metodisti", "Ta'lim Jarayonlari", "O'qituvchilar va maktab ma'muriyati uchun interfeys qulayligi va amaliy standartlarni joriy etish rahbari.", ACCENT_PURPLE)
    ]

    tm_w = 2.7
    tm_gap = 0.28
    tm_x = 0.8
    for idx, (role, spec, exp, col) in enumerate(team):
        x = tm_x + idx * (tm_w + tm_gap)
        card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(2.15), Inches(tm_w), Inches(4.6))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        card.line.width = Pt(1.5)

        tf_tm = card.text_frame
        tf_tm.word_wrap = True
        tf_tm.margin_left = Inches(0.2)
        tf_tm.margin_right = Inches(0.2)
        tf_tm.margin_top = Inches(0.3)

        p_ic = tf_tm.paragraphs[0]
        p_ic.text = "👤"
        p_ic.alignment = PP_ALIGN.CENTER
        p_ic.font.size = Pt(36)
        p_ic.space_after = Pt(10)

        p_r = tf_tm.add_paragraph()
        p_r.text = role
        p_r.alignment = PP_ALIGN.CENTER
        p_r.font.size = Pt(13)
        p_r.font.bold = True
        p_r.font.color.rgb = col
        p_r.space_after = Pt(6)

        p_s = tf_tm.add_paragraph()
        p_s.text = spec
        p_s.alignment = PP_ALIGN.CENTER
        p_s.font.size = Pt(11)
        p_s.font.bold = True
        p_s.font.color.rgb = TEXT_WHITE
        p_s.space_after = Pt(12)

        p_e = tf_tm.add_paragraph()
        p_e.text = exp
        p_e.font.size = Pt(10)
        p_e.font.color.rgb = TEXT_MUTED

    add_notes(s10, "Bizning jamoamiz g'oyani amalga oshirish uchun kerak bo'lgan barcha vakolatlarga ega: mahsulot boshqaruvi, AI va biometriya dasturlash, apparat montaji va maktab ta'lim metodikasi.")

    # =================================================================
    # SLIDE 11: Moliyaviy Reja va So'rov (11-bet)
    # =================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_transition(s11, "push", "l")
    add_slide_header(s11, "11", "Moliyaviy Reja & Investitsiya So'rovi", "Kelgusi 3 Yillik Prognoz va Investitsiya Ehtiyoji", "Tezkor masshtablash va bozor ulushini egallash bo'yicha aniq moliyaviy hisob-kitoblar", ACCENT_GREEN)

    # Left: 3-Year Forecast
    add_card(s11, 0.8, 2.15, 5.6, 4.6, "3 Yillik Moliyaviy Prognoz", [
        "1-Yil: 60 ta maktab ulash ➔ Yillik Tushum: $190,000 | Sof foyda: $65,000",
        "2-Yil: 280 ta maktab ulash ➔ Yillik Tushum: $980,000 | Sof foyda: $380,000",
        "3-Yil: 750 ta maktab ulash ➔ Yillik Tushum: $2,850,000 | Sof foyda: $1,200,000",
        "Bozorning 8% ulushini egallash hisobiga o'zini to'liq qoplaydigan va o'suvchi biznes modeli."
    ], ACCENT_GREEN, "📈")

    # Right: The Ask
    ask_card = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.15), Inches(5.7), Inches(4.6))
    ask_card.fill.solid()
    ask_card.fill.fore_color.rgb = CARD_BG
    ask_card.line.color.rgb = ACCENT_AMBER
    ask_card.line.width = Pt(2)

    tf_a = ask_card.text_frame
    tf_a.word_wrap = True
    tf_a.margin_left = Inches(0.25)
    tf_a.margin_right = Inches(0.25)
    tf_a.margin_top = Inches(0.25)

    p_ah = tf_a.paragraphs[0]
    p_ah.text = "💰  INVESTITSIYA SO'ROVI: $80,000"
    p_ah.font.size = Pt(17)
    p_ah.font.bold = True
    p_ah.font.color.rgb = ACCENT_AMBER
    p_ah.space_after = Pt(12)

    p_at = tf_a.add_paragraph()
    p_at.text = "Kompaniyaning 10-15% ulushi evaziga 18 oylik runway uchun so'ralmoqda."
    p_at.font.size = Pt(11.5)
    p_at.font.bold = True
    p_at.font.color.rgb = TEXT_WHITE
    p_at.space_after = Pt(14)

    splits = [
        "40% — Sotuv va B2G Marketing (Toshkent va viloyatlar bo'yicha)",
        "30% — Uskunalar va Kameralar Aylanma Mablag'i (Zaxira apparat ombori)",
        "20% — Dasturchilar va AI Yuzni Tanish Algoritmini Kuchaytirish",
        "10% — Yuridik xarajatlar, server infratuzilmasi va sertifikatlashtirish"
    ]
    for sp in splits:
        p_sp = tf_a.add_paragraph()
        p_sp.text = f"• {sp}"
        p_sp.font.size = Pt(10.5)
        p_sp.font.color.rgb = TEXT_MUTED
        p_sp.space_after = Pt(6)

    add_notes(s11, "Moliyaviy so'rovimiz: Biz $80,000 miqdorida investitsiya jalb qilmoqchimiz (10-15% ulush evaziga). Bu mablag' 60 ta maktabga tezkor kirib borish, kamera va apparatlar zaxirasini yaratish hamda viloyatlardagi sotuv tarmog'ini yo'lga qo'yishga sarflanadi.")

    # =================================================================
    # SLIDE 12: Kontaktlar va Yakun (12-bet)
    # =================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_transition(s12, "fade")

    final_box = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(0.95), Inches(10.933), Inches(5.6))
    final_box.fill.solid()
    final_box.fill.fore_color.rgb = CARD_BG
    final_box.line.color.rgb = ACCENT_GREEN
    final_box.line.width = Pt(2)

    tf_f = final_box.text_frame
    tf_f.word_wrap = True
    tf_f.margin_top = Inches(0.6)

    p0 = tf_f.paragraphs[0]
    p0.text = "✦  RAQAMLI TA'LIM KELAJAGINI BIRGA QURAMIZ!  ✦"
    p0.alignment = PP_ALIGN.CENTER
    p0.font.name = "Segoe UI"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_GREEN
    p0.space_after = Pt(14)

    p1 = tf_f.add_paragraph()
    p1.text = "Hamkorlik Va Savollar Uchun Rahmat!"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(16)

    p2 = tf_f.add_paragraph()
    p2.text = "«Maktab CRM & Face-ID – Millionlab o'quvchilar xavfsizligi va zamonaviy ta'lim kafolati»"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(15)
    p2.font.italic = True
    p2.font.color.rgb = ACCENT_CYAN
    p2.space_after = Pt(28)

    # 4 Contact Items (Real Project Contacts)
    contacts = [
        ("📞 Telefon", "+998 93 707 80 47", ACCENT_CYAN),
        ("🌐 Jonli Veb-Ilova", "faceforschool.vercel.app", ACCENT_GREEN),
        ("💬 Telegram", "@al11bek", ACCENT_AMBER),
        ("👤 Loyiha Rahbari", "Alibek (CEO)", ACCENT_PURPLE)
    ]
    c_w = 2.45
    c_gap = 0.2
    c_start = 1.45
    c_y = 4.7
    for idx, (c_label, c_val, c_col) in enumerate(contacts):
        x = c_start + idx * (c_w + c_gap)
        c_box = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(c_y), Inches(c_w), Inches(1.15))
        c_box.fill.solid()
        c_box.fill.fore_color.rgb = CARD_BG_ALT
        c_box.line.color.rgb = c_col
        c_box.line.width = Pt(1.5)
        tf_c = c_box.text_frame
        tf_c.margin_top = Inches(0.2)
        p_cl = tf_c.paragraphs[0]
        p_cl.text = c_label
        p_cl.alignment = PP_ALIGN.CENTER
        p_cl.font.name = "Segoe UI"
        p_cl.font.bold = True
        p_cl.font.size = Pt(11)
        p_cl.font.color.rgb = c_col
        p_cv = tf_c.add_paragraph()
        p_cv.text = c_val
        p_cv.alignment = PP_ALIGN.CENTER
        p_cv.font.name = "Segoe UI"
        p_cv.font.bold = True
        p_cv.font.size = Pt(10)
        p_cv.font.color.rgb = TEXT_WHITE

    # Bottom Callout Note
    c_note = s12.shapes.add_textbox(Inches(1.2), Inches(6.0), Inches(10.933), Inches(0.4))
    p_cn = c_note.text_frame.paragraphs[0]
    p_cn.text = "🚀 Jonli Demo Platformani sinab ko'rish: https://faceforschool.vercel.app/  |  Bog'lanish: Alibek"
    p_cn.alignment = PP_ALIGN.CENTER
    p_cn.font.name = "Segoe UI"
    p_cn.font.size = Pt(11)
    p_cn.font.bold = True
    p_cn.font.color.rgb = ACCENT_CYAN

    add_notes(s12, "E'tiboringiz va vaqtingiz uchun minnatdormiz! Loyihamiz haqida to'liq ma'lumot olish yoki savollar bo'lsa, Alibek bilan bevosita bog'lanishingiz mumkin: +998 93 707 80 47, Telegram: @al11bek. Jonli veb-ilovamiz: https://faceforschool.vercel.app/")

    # Save
    out_file = os.path.join(os.getcwd(), "Maktab_CRM_Pitch_Deck.pptx")
    prs.save(out_file)
    print(f"Investor Pitch Deck muvaffaqiyatli yaratildi: {out_file}")

if __name__ == "__main__":
    create_investor_pitch_deck()
