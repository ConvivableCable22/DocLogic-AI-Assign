import os
import zipfile
import xml.sax.saxutils as saxutils

os.makedirs('samples', exist_ok=True)

# -------------------------------------------------------------
# 1. Sample Academic Policy (.txt)
# -------------------------------------------------------------
txt_content = """# MSRUAS B.Tech Academic & Examination Eligibility Policy

# FACTS: Base Student Academic Records
Rahul attendance 85
Rahul cie_marks 38
Rahul lab_completed true
Rahul fee_status cleared
Rahul prerequisites_met true

Priya attendance 72
Priya cie_marks 18
Priya lab_completed true
Priya fee_status cleared
Priya prerequisites_met true

Amit attendance 80
Amit cie_marks 25
Amit lab_completed false
Amit fee_status pending
Amit prerequisites_met false

Sneha attendance 92
Sneha cie_marks 45
Sneha lab_completed true
Sneha fee_status cleared
Sneha prerequisites_met true

# HORN RULES: Academic & Examination Inference Engine
RULE R1: IF ?s attendance >= 75 AND ?s cie_marks >= 20 THEN ?s academic_eligible true
RULE R2: IF ?s academic_eligible == true AND ?s lab_completed == true THEN ?s internal_cleared true
RULE R3: IF ?s internal_cleared == true AND ?s fee_status == cleared THEN ?s hall_ticket_approved true
RULE R4: IF ?s hall_ticket_approved == true AND ?s prerequisites_met == true THEN ?s can_sit_for_exam true
RULE R5: IF ?s attendance >= 85 AND ?s cie_marks >= 40 THEN ?s honors_eligible true
RULE R6: IF ?s attendance < 75 THEN ?s condonation_required true
"""

with open('samples/sample_academic_policy.txt', 'w', encoding='utf-8') as f:
    f.write(txt_content)
print("Created samples/sample_academic_policy.txt")


# -------------------------------------------------------------
# 2. Sample Merit Scholarship Policy (.docx)
# -------------------------------------------------------------
docx_lines = [
    "# MSRUAS Merit Scholarship & Honors Eligibility Policy",
    "",
    "# FACTS: Base Student Academic and Honors Records",
    "Ananya gpa 3.9",
    "Ananya credits 92",
    "Ananya community_hours 45",
    "Ananya fee_status cleared",
    "Ananya conduct_record clean",
    "",
    "Vikram gpa 3.4",
    "Vikram credits 85",
    "Vikram community_hours 20",
    "Vikram fee_status cleared",
    "Vikram conduct_record clean",
    "",
    "Rohan gpa 3.7",
    "Rohan credits 70",
    "Rohan community_hours 10",
    "Rohan fee_status pending",
    "Rohan conduct_record clean",
    "",
    "# HORN RULES: Merit and Award Inference Engine",
    "RULE R1: IF ?s gpa >= 3.8 AND ?s credits >= 80 THEN ?s dean_list true",
    "RULE R2: IF ?s dean_list == true AND ?s conduct_record == clean THEN ?s merit_award_eligible true",
    "RULE R3: IF ?s merit_award_eligible == true AND ?s fee_status == cleared THEN ?s scholarship_approved true",
    "RULE R4: IF ?s community_hours >= 40 AND ?s conduct_record == clean THEN ?s civic_honors true"
]

content_types_xml = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n'
    '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n'
    '  <Default Extension="xml" ContentType="application/xml"/>\n'
    '  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n'
    '</Types>'
)

rels_xml = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
    '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n'
    '</Relationships>'
)

body_xml = []
for line in docx_lines:
    escaped = saxutils.escape(line)
    body_xml.append(f'<w:p><w:r><w:t xml:space="preserve">{escaped}</w:t></w:r></w:p>')

document_xml = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
    '  <w:body>\n'
    + '\n'.join(body_xml) +
    '\n  </w:body>\n'
    '</w:document>'
)

docx_path = 'samples/sample_scholarship_policy.docx'
with zipfile.ZipFile(docx_path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml', content_types_xml)
    z.writestr('_rels/.rels', rels_xml)
    z.writestr('word/document.xml', document_xml)
print("Created samples/sample_scholarship_policy.docx")


# -------------------------------------------------------------
# 3. Sample Library & Resource Access Policy (.pdf)
# -------------------------------------------------------------
pdf_lines = [
    "# MSRUAS Central Library Clearance & Access Policy",
    "",
    "# FACTS: Student Library and Resource Clearance Records",
    "Kavya library_dues 0",
    "Kavya books_returned true",
    "Kavya research_credits 12",
    "Kavya id_verified true",
    "",
    "Karthik library_dues 450",
    "Karthik books_returned false",
    "Karthik research_credits 4",
    "Karthik id_verified true",
    "",
    "Divya library_dues 0",
    "Divya books_returned true",
    "Divya research_credits 6",
    "Divya id_verified true",
    "",
    "# HORN RULES: Library Clearance & Digital Access Inference Engine",
    "RULE R1: IF ?s library_dues <= 0 AND ?s books_returned == true THEN ?s library_cleared true",
    "RULE R2: IF ?s library_cleared == true AND ?s id_verified == true THEN ?s card_renewed true",
    "RULE R3: IF ?s card_renewed == true AND ?s research_credits >= 10 THEN ?s digital_repository_access true",
    "RULE R4: IF ?s library_dues > 0 THEN ?s fine_pending true"
]

def generate_pdf(filename, text_lines):
    # Construct standard valid PDF 1.4 stream
    stream_ops = ["BT", "/F1 10 Tf", "14 TL", "40 780 Td"]
    first = True
    for l in text_lines:
        safe = l.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        if first:
            stream_ops.append(f"({safe}) Tj")
            first = False
        else:
            stream_ops.append(f"T* ({safe}) Tj")
    stream_ops.append("ET")
    stream_data = "\n".join(stream_ops).encode('latin1')

    objects = []
    # 1: Catalog
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    # 2: Pages
    objects.append(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    # 3: Page
    objects.append(b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>")
    # 4: Contents Stream
    objects.append(f"<< /Length {len(stream_data)} >>\nstream\n".encode('latin1') + stream_data + b"\nendstream")
    # 5: Font (Courier)
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

    pdf_bytes = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, obj in enumerate(objects, 1):
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(f"{i} 0 obj\n".encode('latin1'))
        pdf_bytes.extend(obj)
        pdf_bytes.extend(b"\nendobj\n")

    xref_offset = len(pdf_bytes)
    pdf_bytes.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode('latin1'))
    for off in offsets:
        pdf_bytes.extend(f"{off:010d} 00000 n \n".encode('latin1'))

    pdf_bytes.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode('latin1')
    )

    with open(filename, 'wb') as f:
        f.write(pdf_bytes)

generate_pdf('samples/sample_library_policy.pdf', pdf_lines)
print("Created samples/sample_library_policy.pdf")
