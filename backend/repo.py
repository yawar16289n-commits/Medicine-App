"""
Consolidated Report Generator for MedInsights Pro
3 Main Reports:
1. Formula Report - Deep-dive into a specific formula
2. District Report - Deep-dive into a specific district  
3. Comprehensive Report - Full system overview

Features:
- Month-by-month breakdown
- Year selection (2024, 2025, 2026...)
- Current year shows only completed months (excludes current month)
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
import os

def get_styles():
    styles = getSampleStyleSheet()
    return {
        'title': ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, alignment=TA_CENTER, textColor=colors.HexColor('#2c3e50'), spaceAfter=6),
        'subtitle': ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, alignment=TA_CENTER, textColor=colors.HexColor('#7f8c8d'), spaceAfter=15),
        'section': ParagraphStyle('Section', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#2980b9'), spaceBefore=12, spaceAfter=8, backColor=colors.HexColor('#ecf0f1')),
        'body': ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#2c3e50')),
        'alert': ParagraphStyle('Alert', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#c0392b'), fontName='Helvetica-Bold'),
        'success': ParagraphStyle('Success', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#27ae60')),
        'warning': ParagraphStyle('Warning', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#f39c12')),
        'footer': ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#7f8c8d')),
        'small': ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#95a5a6'), alignment=TA_CENTER),
    }

def create_table(headers, data, col_widths=None, alert_rows=None, highlight_rows=None):
    table_data = [headers] + data
    if col_widths is None:
        col_widths = [480 / len(headers)] * len(headers)
    t = Table(table_data, colWidths=col_widths)
    style_commands = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2980b9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2c3e50')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
    ]
    if alert_rows:
        for row_idx in alert_rows:
            style_commands.append(('BACKGROUND', (0, row_idx + 1), (-1, row_idx + 1), colors.HexColor('#ffebee')))
            style_commands.append(('TEXTCOLOR', (0, row_idx + 1), (-1, row_idx + 1), colors.HexColor('#c0392b')))
    if highlight_rows:
        for row_idx in highlight_rows:
            style_commands.append(('BACKGROUND', (0, row_idx + 1), (-1, row_idx + 1), colors.HexColor('#e8f5e9')))
            style_commands.append(('TEXTCOLOR', (0, row_idx + 1), (-1, row_idx + 1), colors.HexColor('#27ae60')))
    t.setStyle(TableStyle(style_commands))
    return t

def get_months_for_year(year):
    """Get months based on year - excludes current month for current year"""
    current_year = datetime.now().year
    current_month = datetime.now().month
    months = ['January', 'February', 'March', 'April', 'May', 'June', 
              'July', 'August', 'September', 'October', 'November', 'December']
    
    if year < current_year:
        return months, 12  # Full year
    elif year == current_year:
        completed = current_month - 1  # Exclude current month
        return months[:completed], completed if completed > 0 else ([], 0)
    return [], 0  # Future year

def get_monthly_data(year, num_months):
    """Sample monthly data - replace with real DB queries"""
    base = {
        'January': {'sales': 89234, 'temp': 18, 'humidity': 42, 'pattern': 'Flu season'},
        'February': {'sales': 72310, 'temp': 21, 'humidity': 38, 'pattern': 'Low season'},
        'March': {'sales': 78456, 'temp': 28, 'humidity': 35, 'pattern': 'Allergy start'},
        'April': {'sales': 85678, 'temp': 33, 'humidity': 32, 'pattern': 'Heat begins'},
        'May': {'sales': 92123, 'temp': 36, 'humidity': 45, 'pattern': 'Heat wave'},
        'June': {'sales': 98456, 'temp': 34, 'humidity': 65, 'pattern': 'Pre-monsoon'},
        'July': {'sales': 112345, 'temp': 31, 'humidity': 78, 'pattern': 'Monsoon peak'},
        'August': {'sales': 118420, 'temp': 30, 'humidity': 82, 'pattern': 'Infections peak'},
        'September': {'sales': 108234, 'temp': 31, 'humidity': 75, 'pattern': 'Monsoon end'},
        'October': {'sales': 95678, 'temp': 29, 'humidity': 58, 'pattern': 'Transition'},
        'November': {'sales': 88456, 'temp': 24, 'humidity': 48, 'pattern': 'Cooling'},
        'December': {'sales': 98432, 'temp': 19, 'humidity': 45, 'pattern': 'Winter start'},
    }
    months, _ = get_months_for_year(year)
    result = []
    for month in months[:num_months]:
        data = base[month].copy()
        data['sales'] = int(data['sales'] * (1 + (year - 2024) * 0.08))  # 8% YoY growth
        data['month'] = month
        result.append(data)
    return result


# ==================== FORMULA REPORT ====================
def generate_formula_report(formula_name, year):
    months, num_months = get_months_for_year(year)
    if num_months == 0:
        print(f"No completed months for {year}")
        return
    
    output = f'reports/Formula_Report_{formula_name.replace(" ", "_")}_{year}.pdf'
    doc = SimpleDocTemplate(output, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    monthly_data = get_monthly_data(year, num_months)
    total_sales = sum(int(d['sales'] * 0.14) for d in monthly_data)
    
    # Header
    elements.append(Paragraph('Formula Performance Report', styles['title']))
    elements.append(Paragraph(formula_name.upper(), styles['title']))
    elements.append(Paragraph(f'Year: {year} | Months: {months[0]} - {months[-1]} ({num_months} months)', styles['subtitle']))
    elements.append(Paragraph(f'Generated: {datetime.now().strftime("%B %d, %Y %H:%M")}', styles['small']))
    elements.append(Spacer(1, 15))
    
    # Overview
    elements.append(Paragraph('Overview', styles['section']))
    elements.append(create_table(['Metric', 'Value', 'Notes'], [
        ['Total Sales', f'{total_sales:,} units', f'+{12+(year-2024)*3}% vs {year-1}'],
        ['Market Share', '14.2%', '#1 of 34 formulas'],
        ['Districts', '12 of 12', '100% coverage'],
        ['SKUs', '8 medicines', 'Panadol, Calpol, etc.'],
        ['Forecast Accuracy', '98.5%', 'Best performer'],
    ], [140, 130, 160]))
    elements.append(Spacer(1, 10))
    
    # Monthly Breakdown
    elements.append(Paragraph('Month-by-Month Performance', styles['section']))
    monthly_rows = []
    for d in monthly_data:
        sales = int(d['sales'] * 0.14)
        monthly_rows.append([d['month'], f'{sales:,}', f"{d['temp']}°C", f"{d['humidity']}%", d['pattern']])
    monthly_rows.append(['TOTAL', f'{total_sales:,}', '-', '-', f'{num_months} months'])
    elements.append(create_table(['Month', 'Sales', 'Temp', 'Humidity', 'Pattern'], monthly_rows, 
                                  [70, 70, 50, 55, 140], highlight_rows=[len(monthly_rows)-1]))
    elements.append(Spacer(1, 10))
    
    # Medicines
    elements.append(Paragraph('Medicines in Formula', styles['section']))
    elements.append(create_table(['#', 'Medicine', 'Share', 'Units'], [
        ['1', 'Panadol 500mg', '45%', f'{int(total_sales*0.45):,}'],
        ['2', 'Calpol Syrup', '23%', f'{int(total_sales*0.23):,}'],
        ['3', 'Arinac Forte', '15%', f'{int(total_sales*0.15):,}'],
        ['4', 'Others (5)', '17%', f'{int(total_sales*0.17):,}'],
    ], [30, 130, 60, 90]))
    
    elements.append(PageBreak())
    
    # Districts
    elements.append(Paragraph('Performance by District', styles['section']))
    elements.append(create_table(['District', 'Sales', 'Share', 'Growth'], [
        ['Bahadurabad', f'{int(total_sales*0.18):,}', '18%', '+22%'],
        ['Gulshan', f'{int(total_sales*0.14):,}', '14%', '+15%'],
        ['Clifton', f'{int(total_sales*0.12):,}', '12%', '+18%'],
        ['Others (9)', f'{int(total_sales*0.56):,}', '56%', '+11%'],
    ], [110, 90, 60, 60]))
    elements.append(Spacer(1, 10))
    
    # Forecast Accuracy
    elements.append(Paragraph('Forecast Accuracy by Month', styles['section']))
    forecast_rows = []
    for d in monthly_data:
        pred = int(d['sales'] * 0.14 * 0.98)
        act = int(d['sales'] * 0.14)
        acc = round(min(pred, act) / max(pred, act) * 100, 1)
        forecast_rows.append([d['month'][:3], f'{pred:,}', f'{act:,}', f'{acc}%'])
    elements.append(create_table(['Month', 'Predicted', 'Actual', 'Accuracy'], forecast_rows, [60, 100, 100, 80]))
    elements.append(Paragraph('Overall: 98.5% accuracy | MAPE: 1.5%', styles['success']))
    elements.append(Spacer(1, 10))
    
    # Weather
    elements.append(Paragraph('Weather Impact', styles['section']))
    elements.append(create_table(['Condition', 'Impact', 'Correlation'], [
        ['Temp < 20°C', '+35%', 'Strong (0.87)'],
        ['Humidity > 75%', '+12%', 'Moderate (0.65)'],
        ['Rain Events', '+18%', 'Strong (0.71)'],
    ], [150, 80, 100]))
    elements.append(Spacer(1, 10))
    
    # Stock
    elements.append(Paragraph('Current Stock Status', styles['section']))
    elements.append(create_table(['Medicine', 'Stock', 'Days Left', 'Status'], [
        ['Panadol 500mg', '12,450', '18 days', 'Healthy'],
        ['Calpol Syrup', '2,340', '6 days', 'WARNING'],
        ['Arinac Forte', '4,560', '14 days', 'Low'],
    ], [120, 80, 70, 80], alert_rows=[1]))
    elements.append(Spacer(1, 10))
    
    # Recommendations
    elements.append(Paragraph('Recommendations', styles['section']))
    for r in ['1. REORDER: Calpol Syrup - order 5,000 units', '2. SEASONAL: +30% stock before winter',
              '3. MONITOR: Bahadurabad growing +22%']:
        elements.append(Paragraph(r, styles['body']))
        elements.append(Spacer(1, 4))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f'Formula Report | {formula_name} | {year} | MedInsights Pro', styles['footer']))
    
    doc.build(elements)
    print(f'Generated: {output}')


# ==================== DISTRICT REPORT ====================
def generate_district_report(district_name, year):
    months, num_months = get_months_for_year(year)
    if num_months == 0:
        print(f"No completed months for {year}")
        return
    
    output = f'reports/District_Report_{district_name.replace(" ", "_")}_{year}.pdf'
    doc = SimpleDocTemplate(output, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    monthly_data = get_monthly_data(year, num_months)
    total_sales = sum(int(d['sales'] * 0.15) for d in monthly_data)
    
    # Header
    elements.append(Paragraph('District Performance Report', styles['title']))
    elements.append(Paragraph(district_name.upper(), styles['title']))
    elements.append(Paragraph(f'Year: {year} | Months: {months[0]} - {months[-1]} ({num_months} months)', styles['subtitle']))
    elements.append(Paragraph(f'Generated: {datetime.now().strftime("%B %d, %Y %H:%M")}', styles['small']))
    elements.append(Spacer(1, 15))
    
    # Overview
    elements.append(Paragraph('Overview', styles['section']))
    elements.append(create_table(['Metric', 'Value', 'Notes'], [
        ['Total Sales', f'{total_sales:,} units', f'+18% vs {year-1}'],
        ['Market Share', '15.0%', '#1 of 12 districts'],
        ['Medicines', '142 of 156', '91% coverage'],
        ['Stockouts', '4 incidents', 'Down from 8'],
    ], [140, 130, 160]))
    elements.append(Spacer(1, 10))
    
    # Monthly Breakdown
    elements.append(Paragraph('Month-by-Month Performance', styles['section']))
    monthly_rows = []
    for i, d in enumerate(monthly_data):
        sales = int(d['sales'] * 0.15)
        prev = int(monthly_data[i-1]['sales'] * 0.15) if i > 0 else sales
        mom = ((sales - prev) / prev * 100) if i > 0 else 0
        monthly_rows.append([d['month'], f'{sales:,}', f'{mom:+.1f}%' if i > 0 else '-', f"{d['temp']}°C", d['pattern']])
    monthly_rows.append(['TOTAL', f'{total_sales:,}', '-', '-', f'{num_months} months'])
    elements.append(create_table(['Month', 'Sales', 'MoM', 'Temp', 'Pattern'], monthly_rows, 
                                  [70, 70, 50, 50, 140], highlight_rows=[len(monthly_rows)-1]))
    elements.append(Spacer(1, 10))
    
    # Top Medicines
    elements.append(Paragraph('Top Medicines', styles['section']))
    elements.append(create_table(['#', 'Medicine', 'Formula', 'Units', 'Growth'], [
        ['1', 'Panadol 500mg', 'Paracetamol', f'{int(total_sales*0.08):,}', '+22%'],
        ['2', 'Augmentin 625mg', 'Amoxicillin', f'{int(total_sales*0.06):,}', '+15%'],
        ['3', 'Calpol Syrup', 'Paracetamol', f'{int(total_sales*0.05):,}', '+28%'],
        ['4', 'Others', 'Various', f'{int(total_sales*0.81):,}', '+10%'],
    ], [25, 100, 90, 70, 55]))
    
    elements.append(PageBreak())
    
    # Top Formulas
    elements.append(Paragraph('Top Formulas', styles['section']))
    elements.append(create_table(['Formula', 'Units', 'Share', 'Growth'], [
        ['Paracetamol', f'{int(total_sales*0.16):,}', '16%', '+20%'],
        ['Amoxicillin', f'{int(total_sales*0.09):,}', '9%', '+14%'],
        ['Ibuprofen', f'{int(total_sales*0.07):,}', '7%', '+11%'],
        ['Others (29)', f'{int(total_sales*0.68):,}', '68%', '+10%'],
    ], [120, 90, 60, 60]))
    elements.append(Spacer(1, 10))
    
    # Stock Alerts
    elements.append(Paragraph('Stock Alerts', styles['section']))
    elements.append(create_table(['Medicine', 'Stock', 'Status', 'Action'], [
        ['Ponstan 500mg', '0', 'OUT OF STOCK', 'URGENT'],
        ['Calpol Syrup', '234', '3 days left', 'Order 5,000'],
        ['Ventolin', '156', '4 days left', 'Order 1,500'],
    ], [110, 70, 80, 100], alert_rows=[0, 1, 2]))
    elements.append(Paragraph('3 medicines need immediate attention', styles['alert']))
    elements.append(Spacer(1, 10))
    
    # Forecast
    elements.append(Paragraph('Forecast Accuracy by Month', styles['section']))
    forecast_rows = []
    for d in monthly_data:
        pred = int(d['sales'] * 0.15 * 0.97)
        act = int(d['sales'] * 0.15)
        acc = round(min(pred, act) / max(pred, act) * 100, 1)
        forecast_rows.append([d['month'][:3], f'{pred:,}', f'{act:,}', f'{acc}%'])
    elements.append(create_table(['Month', 'Predicted', 'Actual', 'Accuracy'], forecast_rows, [60, 100, 100, 80]))
    elements.append(Paragraph('District Accuracy: 93.2% | MAPE: 6.8%', styles['success']))
    elements.append(Spacer(1, 10))
    
    # Weather
    elements.append(Paragraph('Weather Impact', styles['section']))
    elements.append(create_table(['Condition', 'Period', 'Impact', 'Top Meds'], [
        ['Monsoon', 'Jul-Sep', '+31%', 'Antibiotics'],
        ['Winter', 'Dec-Feb', '+22%', 'Paracetamol'],
        ['Heat', 'May-Jun', '+15%', 'ORS'],
    ], [100, 70, 60, 130]))
    elements.append(Spacer(1, 10))
    
    # Comparison
    elements.append(Paragraph('District Comparison', styles['section']))
    elements.append(create_table(['District', 'Sales', 'Share', 'Rank'], [
        [district_name, f'{total_sales:,}', '15%', '#1'],
        ['Gulshan', f'{int(total_sales*0.84):,}', '12.6%', '#2'],
        ['Clifton', f'{int(total_sales*0.76):,}', '11.4%', '#3'],
    ], [110, 90, 60, 50], highlight_rows=[0]))
    elements.append(Spacer(1, 10))
    
    # Recommendations
    elements.append(Paragraph('Recommendations', styles['section']))
    for r in ['1. URGENT: Ponstan 500mg out of stock', '2. RESTOCK: 3 medicines below 7 days',
              '3. GROWTH: District +18% - increase allocation']:
        elements.append(Paragraph(r, styles['body']))
        elements.append(Spacer(1, 4))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f'District Report | {district_name} | {year} | MedInsights Pro', styles['footer']))
    
    doc.build(elements)
    print(f'Generated: {output}')


# ==================== COMPREHENSIVE REPORT ====================
def generate_comprehensive_report(year):
    months, num_months = get_months_for_year(year)
    if num_months == 0:
        print(f"No completed months for {year}")
        return
    
    output = f'reports/Comprehensive_Report_{year}.pdf'
    doc = SimpleDocTemplate(output, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    monthly_data = get_monthly_data(year, num_months)
    total_sales = sum(d['sales'] for d in monthly_data)
    
    # Header
    elements.append(Paragraph('Comprehensive Annual Report', styles['title']))
    elements.append(Paragraph('MedInsights Pro', styles['title']))
    elements.append(Paragraph(f'Year: {year} | Months: {months[0]} - {months[-1]} ({num_months} months)', styles['subtitle']))
    elements.append(Paragraph(f'Generated: {datetime.now().strftime("%B %d, %Y %H:%M")}', styles['small']))
    elements.append(Spacer(1, 15))
    
    # Executive Summary
    elements.append(Paragraph('Executive Summary', styles['section']))
    elements.append(create_table(['Metric', 'Value', 'Notes'], [
        ['Total Sales', f'{total_sales:,} units', f'+12% vs {year-1}'],
        ['Medicines', '156 SKUs', '+8 new'],
        ['Formulas', '34', '+3 new'],
        ['Districts', '12', '100% coverage'],
        ['Forecast Accuracy', '91.2%', '+2.1%'],
        ['Stockouts', '23', 'Down 44%'],
    ], [150, 130, 150]))
    elements.append(Spacer(1, 10))
    
    # Monthly
    elements.append(Paragraph('Month-by-Month Overview', styles['section']))
    monthly_rows = []
    for d in monthly_data:
        monthly_rows.append([d['month'], f"{d['sales']:,}", f"{d['temp']}°C", f"{d['humidity']}%", d['pattern']])
    monthly_rows.append(['TOTAL', f'{total_sales:,}', '-', '-', f'{num_months} months'])
    elements.append(create_table(['Month', 'Sales', 'Temp', 'Humidity', 'Pattern'], monthly_rows,
                                  [80, 80, 50, 55, 120], highlight_rows=[len(monthly_rows)-1]))
    peak = max(monthly_data, key=lambda x: x['sales'])
    low = min(monthly_data, key=lambda x: x['sales'])
    elements.append(Paragraph(f"Peak: {peak['month']} ({peak['sales']:,}) | Low: {low['month']} ({low['sales']:,})", styles['body']))
    elements.append(Spacer(1, 10))
    
    # Top Medicines
    elements.append(Paragraph('Top 5 Medicines', styles['section']))
    elements.append(create_table(['#', 'Medicine', 'Formula', 'Units', 'Growth'], [
        ['1', 'Panadol 500mg', 'Paracetamol', f'{int(total_sales*0.072):,}', '+22%'],
        ['2', 'Augmentin 625mg', 'Amoxicillin', f'{int(total_sales*0.054):,}', '+18%'],
        ['3', 'Calpol Syrup', 'Paracetamol', f'{int(total_sales*0.043):,}', '+31%'],
        ['4', 'Brufen 400mg', 'Ibuprofen', f'{int(total_sales*0.039):,}', '+12%'],
        ['5', 'Flagyl 400mg', 'Metronidazole', f'{int(total_sales*0.034):,}', '+8%'],
    ], [25, 100, 90, 80, 55]))
    
    elements.append(PageBreak())
    
    # Districts
    elements.append(Paragraph('District Performance', styles['section']))
    elements.append(create_table(['District', 'Sales', 'Share', 'Rank', 'Growth'], [
        ['Bahadurabad', f'{int(total_sales*0.15):,}', '15%', '#1', '+18%'],
        ['Gulshan', f'{int(total_sales*0.126):,}', '12.6%', '#2', '+9%'],
        ['Clifton', f'{int(total_sales*0.114):,}', '11.4%', '#3', '+14%'],
        ['Saddar', f'{int(total_sales*0.103):,}', '10.3%', '#4', '+6%'],
        ['Others (8)', f'{int(total_sales*0.507):,}', '50.7%', '-', '+8%'],
    ], [90, 80, 55, 45, 55]))
    elements.append(Spacer(1, 10))
    
    # Formulas
    elements.append(Paragraph('Top Formulas', styles['section']))
    elements.append(create_table(['Formula', 'Sales', 'Share', 'Accuracy', 'Growth'], [
        ['Paracetamol', f'{int(total_sales*0.141):,}', '14.1%', '98.5%', '+20%'],
        ['Amoxicillin', f'{int(total_sales*0.084):,}', '8.4%', '85.2%', '+14%'],
        ['Ibuprofen', f'{int(total_sales*0.066):,}', '6.6%', '88.6%', '+11%'],
        ['Others (31)', f'{int(total_sales*0.709):,}', '70.9%', '90%', '+10%'],
    ], [100, 80, 55, 70, 55]))
    elements.append(Spacer(1, 10))
    
    # Stock Status
    elements.append(Paragraph('Inventory Status', styles['section']))
    elements.append(create_table(['Status', 'Count', '% SKUs'], [
        ['Healthy (>30 days)', '112', '71.8%'],
        ['Low (<14 days)', '31', '19.9%'],
        ['Critical (<7 days)', '8', '5.1%'],
        ['Out of Stock', '5', '3.2%'],
    ], [150, 100, 100], alert_rows=[2, 3]))
    elements.append(Spacer(1, 10))
    
    # Forecast
    elements.append(Paragraph('Forecast Accuracy by Month', styles['section']))
    forecast_rows = []
    for d in monthly_data:
        acc = 91 + (hash(d['month']) % 5)
        forecast_rows.append([d['month'][:3], f'{acc}%', f'{100-acc}%'])
    elements.append(create_table(['Month', 'Accuracy', 'MAPE'], forecast_rows, [80, 100, 100]))
    elements.append(Paragraph('Overall: 91.2% accuracy | MAPE: 8.8% | Target <10%: PASS', styles['success']))
    
    elements.append(PageBreak())
    
    # Weather
    elements.append(Paragraph('Weather Impact Summary', styles['section']))
    elements.append(create_table(['Season', 'Temp', 'Humidity', 'Demand', 'Top Meds'], [
        ['Winter (Dec-Feb)', '18°C', '45%', '+22%', 'Paracetamol'],
        ['Spring (Mar-May)', '32°C', '38%', '+15%', 'Antihistamines'],
        ['Monsoon (Jun-Sep)', '30°C', '78%', '+31%', 'Antibiotics'],
        ['Autumn (Oct-Nov)', '26°C', '52%', '+8%', 'Mixed'],
    ], [90, 50, 55, 55, 100]))
    elements.append(Spacer(1, 10))
    
    # Recommendations
    elements.append(Paragraph(f'Recommendations for {year + 1}', styles['section']))
    for r in [
        '1. STOCK: +15% Paracetamol before winter',
        '2. FORECAST: Review Amoxicillin model (high variance)',
        '3. DISTRICT: Investigate N. Nazimabad decline',
        '4. WEATHER: Implement weather-triggered alerts',
        '5. INVENTORY: Address 5 out-of-stock items',
        '6. SEASONAL: Pre-position Antibiotics before monsoon',
    ]:
        elements.append(Paragraph(r, styles['body']))
        elements.append(Spacer(1, 4))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f'Comprehensive Report | {year} | MedInsights Pro', styles['footer']))
    
    doc.build(elements)
    print(f'Generated: {output}')


# ==================== MAIN ====================
def main():
    os.makedirs('reports', exist_ok=True)
    
    print("\n" + "="*60)
    print("  MedInsights Pro - Report Generator")
    print("="*60)
    
    current_year = datetime.now().year
    current_month = datetime.now().strftime('%B')
    
    print(f"\nToday: {datetime.now().strftime('%B %d, %Y')}")
    print(f"Note: {current_month} {current_year} excluded (incomplete)")
    
    print("\nReports:")
    print("  1. Formula Report")
    print("  2. District Report")
    print("  3. Comprehensive Report")
    print("  4. Generate All Samples")
    print("  0. Exit")
    
    choice = input("\nSelect (0-4): ").strip()
    if choice == '0': return
    
    year = input(f"Year (2024-{current_year}) [2025]: ").strip()
    year = int(year) if year.isdigit() else 2025
    year = max(2024, min(year, current_year))
    
    if choice == '1':
        formula = input("Formula [Paracetamol]: ").strip() or "Paracetamol"
        generate_formula_report(formula, year)
    elif choice == '2':
        district = input("District [Bahadurabad]: ").strip() or "Bahadurabad"
        generate_district_report(district, year)
    elif choice == '3':
        generate_comprehensive_report(year)
    elif choice == '4':
        generate_formula_report("Paracetamol", year)
        generate_district_report("Bahadurabad", year)
        generate_comprehensive_report(year)
        print("\n3 reports generated!")
    
    print("\nReports in: backend/reports/")

if __name__ == '__main__':
    main()