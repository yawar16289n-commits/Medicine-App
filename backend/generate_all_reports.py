"""
Generate database-driven report PDFs for MedInsights Pro
Pulls real data from: MedicineSales, MedicineForecast, WeatherData, Medicine, Formula, District
"""
import os
import sys
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from sqlalchemy import func, extract, desc

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database import db
from models import Medicine, MedicineSales, MedicineForecast, WeatherData, Formula, District


def get_styles():
    """Get styled paragraph styles for reports"""
    styles = getSampleStyleSheet()
    return {
        'title': ParagraphStyle('Title', parent=styles['Heading1'], fontSize=22, alignment=TA_CENTER, textColor=colors.HexColor('#2c3e50'), spaceAfter=6),
        'subtitle': ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=11, alignment=TA_CENTER, textColor=colors.HexColor('#7f8c8d'), spaceAfter=15),
        'section': ParagraphStyle('Section', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#2980b9'), spaceBefore=12, spaceAfter=8, backColor=colors.HexColor('#ecf0f1')),
        'body': ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#2c3e50')),
        'alert': ParagraphStyle('Alert', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#c0392b'), fontName='Helvetica-Bold'),
        'success': ParagraphStyle('Success', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#27ae60')),
        'warning': ParagraphStyle('Warning', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#f39c12')),
        'footer': ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#7f8c8d')),
    }


def create_table(headers, data, col_widths=None, alert_rows=None, keep_together=False):
    """Create a styled table for reports
    
    Args:
        headers: List of column header strings
        data: List of row data lists
        col_widths: Optional list of column widths
        alert_rows: Optional list of row indices to highlight as alerts
        keep_together: If True, prevents table from splitting across pages (use for small tables)
    """
    if not data:
        data = [['No data available'] + [''] * (len(headers) - 1)]
    table_data = [headers] + data
    if col_widths is None:
        col_widths = [480 / len(headers)] * len(headers)
    t = Table(table_data, colWidths=col_widths, repeatRows=1)  # repeatRows=1 keeps header on each page
    
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
    
    t.setStyle(TableStyle(style_commands))
    
    # Wrap in KeepTogether to prevent splitting for small tables
    if keep_together:
        return KeepTogether([t])
    return t


def get_month_name(month_num):
    """Get month name from number"""
    months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    return months[month_num] if 1 <= month_num <= 12 else ''


def calculate_accuracy(forecasted, actual):
    """Calculate forecast accuracy: 100 - ABS(forecasted - actual) / actual * 100"""
    if actual == 0:
        return 0.0 if forecasted == 0 else 0.0
    accuracy = 100 - abs(forecasted - actual) / actual * 100
    return max(0, min(100, accuracy))


def get_accuracy_rating(accuracy):
    """Get rating based on accuracy percentage"""
    if accuracy >= 95:
        return 'Excellent'
    elif accuracy >= 90:
        return 'Good'
    elif accuracy >= 85:
        return 'Acceptable'
    else:
        return 'Needs Improvement'


def format_change(current, previous):
    """Format year-over-year change as percentage string"""
    if previous == 0:
        return 'New' if current > 0 else '-'
    change = ((current - previous) / previous) * 100
    if change >= 0:
        return f'+{change:.1f}%'
    else:
        return f'{change:.1f}%'


def get_previous_year_sales_by_formula(year, months_to_include):
    """Get previous year sales data grouped by formula (for comparison)"""
    prev_year = year - 1
    query = db.session.query(
        Formula.name,
        func.sum(MedicineSales.quantity).label('total_sales')
    ).join(
        Medicine, Formula.id == Medicine.formula_id
    ).join(
        MedicineSales, Medicine.id == MedicineSales.medicine_id
    ).filter(
        extract('year', MedicineSales.date) == prev_year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Formula.id, Formula.name)
    
    return {f.name: f.total_sales for f in query.all()}


def get_previous_year_sales_by_district(year, months_to_include):
    """Get previous year sales data grouped by district (for comparison)"""
    prev_year = year - 1
    query = db.session.query(
        District.name,
        func.sum(MedicineSales.quantity).label('total_sales')
    ).join(
        MedicineSales, District.id == MedicineSales.district_id
    ).filter(
        extract('year', MedicineSales.date) == prev_year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(District.id, District.name)
    
    return {d.name: d.total_sales for d in query.all()}


def get_previous_year_total_sales(year, months_to_include):
    """Get previous year total sales"""
    prev_year = year - 1
    return db.session.query(
        func.sum(MedicineSales.quantity)
    ).filter(
        extract('year', MedicineSales.date) == prev_year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0


# ==================== DATA QUERY FUNCTIONS ====================

def get_sales_by_formula(year, months_to_include):
    """Get sales data grouped by formula"""
    query = db.session.query(
        Formula.name,
        func.sum(MedicineSales.quantity).label('total_sales'),
        func.count(func.distinct(Medicine.id)).label('brand_count')
    ).join(
        Medicine, Formula.id == Medicine.formula_id
    ).join(
        MedicineSales, Medicine.id == MedicineSales.medicine_id
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Formula.id, Formula.name).order_by(desc('total_sales'))
    
    return query.all()


def get_monthly_sales_by_formula(year, months_to_include, top_formulas):
    """Get monthly breakdown of sales by formula"""
    results = {}
    for formula_name in top_formulas:
        formula_monthly = db.session.query(
            extract('month', MedicineSales.date).label('month'),
            func.sum(MedicineSales.quantity).label('quantity')
        ).join(
            Medicine, MedicineSales.medicine_id == Medicine.id
        ).join(
            Formula, Medicine.formula_id == Formula.id
        ).filter(
            Formula.name == formula_name,
            extract('year', MedicineSales.date) == year,
            extract('month', MedicineSales.date).in_(months_to_include)
        ).group_by(extract('month', MedicineSales.date)).all()
        
        results[formula_name] = {int(m.month): m.quantity for m in formula_monthly}
    return results


def get_forecast_accuracy_by_formula(year, months_to_include):
    """Calculate forecast accuracy by comparing forecasts with actual sales"""
    forecasts = db.session.query(
        Formula.name,
        func.sum(MedicineForecast.forecasted_quantity).label('forecasted')
    ).join(
        Medicine, MedicineForecast.medicine_id == Medicine.id
    ).join(
        Formula, Medicine.formula_id == Formula.id
    ).filter(
        extract('year', MedicineForecast.forecast_date) == year,
        extract('month', MedicineForecast.forecast_date).in_(months_to_include)
    ).group_by(Formula.id, Formula.name).all()
    
    forecasts_dict = {f.name: f.forecasted for f in forecasts}
    
    actuals = db.session.query(
        Formula.name,
        func.sum(MedicineSales.quantity).label('actual')
    ).join(
        Medicine, MedicineSales.medicine_id == Medicine.id
    ).join(
        Formula, Medicine.formula_id == Formula.id
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Formula.id, Formula.name).all()
    
    results = []
    for actual in actuals:
        forecasted = forecasts_dict.get(actual.name, 0)
        accuracy = calculate_accuracy(forecasted, actual.actual)
        results.append({
            'formula': actual.name,
            'forecasted': forecasted,
            'actual': actual.actual,
            'accuracy': accuracy,
            'rating': get_accuracy_rating(accuracy)
        })
    
    return sorted(results, key=lambda x: x['accuracy'], reverse=True)


def get_sales_by_district(year, months_to_include):
    """Get sales data grouped by district"""
    query = db.session.query(
        District.name,
        func.sum(MedicineSales.quantity).label('total_sales')
    ).join(
        MedicineSales, District.id == MedicineSales.district_id
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(District.id, District.name).order_by(desc('total_sales'))
    
    return query.all()


def get_monthly_sales_by_district(year, months_to_include, top_districts):
    """Get monthly breakdown of sales by district"""
    results = {}
    for district_name in top_districts:
        district_monthly = db.session.query(
            extract('month', MedicineSales.date).label('month'),
            func.sum(MedicineSales.quantity).label('quantity')
        ).join(
            District, MedicineSales.district_id == District.id
        ).filter(
            District.name == district_name,
            extract('year', MedicineSales.date) == year,
            extract('month', MedicineSales.date).in_(months_to_include)
        ).group_by(extract('month', MedicineSales.date)).all()
        
        results[district_name] = {int(m.month): m.quantity for m in district_monthly}
    return results


def get_forecast_accuracy_by_district(year, months_to_include):
    """Calculate forecast accuracy by district"""
    forecasts = db.session.query(
        District.name,
        func.sum(MedicineForecast.forecasted_quantity).label('forecasted')
    ).join(
        MedicineForecast, District.id == MedicineForecast.district_id
    ).filter(
        extract('year', MedicineForecast.forecast_date) == year,
        extract('month', MedicineForecast.forecast_date).in_(months_to_include)
    ).group_by(District.id, District.name).all()
    
    forecasts_dict = {f.name: f.forecasted for f in forecasts}
    
    actuals = db.session.query(
        District.name,
        func.sum(MedicineSales.quantity).label('actual')
    ).join(
        MedicineSales, District.id == MedicineSales.district_id
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(District.id, District.name).all()
    
    results = []
    for actual in actuals:
        forecasted = forecasts_dict.get(actual.name, 0)
        accuracy = calculate_accuracy(forecasted, actual.actual)
        mape = 100 - accuracy if accuracy > 0 else 0
        results.append({
            'district': actual.name,
            'forecasted': forecasted,
            'actual': actual.actual,
            'accuracy': accuracy,
            'mape': mape,
            'rating': get_accuracy_rating(accuracy)
        })
    
    return sorted(results, key=lambda x: x['accuracy'], reverse=True)


def get_top_medicines_by_district(year, months_to_include):
    """Get all medicines ranked by sales for each district (not just top one)."""
    results = []
    districts = District.query.all()

    for district in districts:
        meds = db.session.query(
            Medicine.brand_name,
            Formula.name.label('formula_name'),
            func.sum(MedicineSales.quantity).label('quantity')
        ).join(
            Medicine, MedicineSales.medicine_id == Medicine.id
        ).join(
            Formula, Medicine.formula_id == Formula.id
        ).filter(
            MedicineSales.district_id == district.id,
            extract('year', MedicineSales.date) == year,
            extract('month', MedicineSales.date).in_(months_to_include)
        ).group_by(Medicine.id, Medicine.brand_name, Formula.name
        ).order_by(desc('quantity')).all()

        for m in meds:
            results.append({
                'district': district.name,
                'medicine': m.brand_name,
                'formula': m.formula_name,
                'quantity': m.quantity
            })

    return results


def get_weather_data_by_month(year, months_to_include):
    """Get average weather data by month"""
    query = db.session.query(
        extract('month', WeatherData.date).label('month'),
        func.avg(WeatherData.apparent_temperature_mean).label('avg_temp'),
        func.avg(WeatherData.relative_humidity_2m_mean).label('avg_humidity')
    ).filter(
        extract('year', WeatherData.date) == year,
        extract('month', WeatherData.date).in_(months_to_include)
    ).group_by(extract('month', WeatherData.date)).order_by('month')
    
    return query.all()


def get_top_medicines(year, months_to_include, limit=None):
    """Get top selling medicines for the year.
    If limit is None, returns all ranked medicines."""
    query = db.session.query(
        Medicine.brand_name,
        Formula.name.label('formula_name'),
        func.sum(MedicineSales.quantity).label('total_sales')
    ).join(
        MedicineSales, Medicine.id == MedicineSales.medicine_id
    ).join(
        Formula, Medicine.formula_id == Formula.id
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Medicine.id, Medicine.brand_name, Formula.name
    ).order_by(desc('total_sales'))

    if limit is not None:
        query = query.limit(limit)

    return query.all()


def get_monthly_performance(year, months_to_include):
    """Get monthly sales performance with forecast accuracy"""
    results = []
    
    for month in months_to_include:
        actual_sales = db.session.query(
            func.sum(MedicineSales.quantity)
        ).filter(
            extract('year', MedicineSales.date) == year,
            extract('month', MedicineSales.date) == month
        ).scalar() or 0
        
        forecasted = db.session.query(
            func.sum(MedicineForecast.forecasted_quantity)
        ).filter(
            extract('year', MedicineForecast.forecast_date) == year,
            extract('month', MedicineForecast.forecast_date) == month
        ).scalar() or 0
        
        accuracy = calculate_accuracy(forecasted, actual_sales)
        
        results.append({
            'month': month,
            'actual_sales': actual_sales,
            'forecasted': forecasted,
            'accuracy': accuracy
        })
    
    return results


def calculate_overall_accuracy(year, months_to_include):
    """Calculate overall forecast accuracy for the year"""
    total_forecasted = db.session.query(
        func.sum(MedicineForecast.forecasted_quantity)
    ).filter(
        extract('year', MedicineForecast.forecast_date) == year,
        extract('month', MedicineForecast.forecast_date).in_(months_to_include)
    ).scalar() or 0
    
    total_actual = db.session.query(
        func.sum(MedicineSales.quantity)
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    return calculate_accuracy(total_forecasted, total_actual)


# ==================== REPORT 1: FORMULA REPORT ====================
def generate_formula_report(year=None):
    """Generate Formula-based report with real database data"""
    if year is None:
        year = datetime.now().year
    
    output_path = f'reports/Formula_Report_{year}.pdf'
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    
    current_date = datetime.now()
    if year == current_date.year:
        months_to_include = list(range(1, current_date.month))
        period_text = f"January - {get_month_name(current_date.month - 1)} {year}" if current_date.month > 1 else "No data yet"
    elif year < current_date.year:
        months_to_include = list(range(1, 13))
        period_text = f"Full Year {year}"
    else:
        months_to_include = []
        period_text = "Future year - no data"
    
    elements.append(Paragraph('FORMULA ANALYSIS REPORT', styles['title']))
    elements.append(Paragraph(f'Year: {year} - Database Data', styles['title']))
    elements.append(Paragraph(f'Period: {period_text} | Generated: {datetime.now().strftime("%B %d, %Y at %H:%M")}', styles['subtitle']))
    
    if not months_to_include:
        elements.append(Paragraph('No data available for this period.', styles['body']))
        doc.build(elements)
        print(f'Generated: {output_path}')
        return
    
    # Formula Summary Section - Real Data
    elements.append(Paragraph('Formula Performance Summary', styles['section']))
    
    formula_sales = get_sales_by_formula(year, months_to_include)
    total_sales = sum(f.total_sales for f in formula_sales) if formula_sales else 0
    
    # Get previous year data for comparison
    prev_year_formula_sales = get_previous_year_sales_by_formula(year, months_to_include)
    
    formula_data = []
    top_formula_names = []
    for f in formula_sales[:6]:
        share = (f.total_sales / total_sales * 100) if total_sales > 0 else 0
        prev_sales = prev_year_formula_sales.get(f.name, 0)
        change = format_change(f.total_sales, prev_sales)
        formula_data.append([f.name, f'{f.total_sales:,}', f'{share:.1f}%', change, f'{f.brand_count} brands'])
        top_formula_names.append(f.name)
    
    others_sales = sum(f.total_sales for f in formula_sales[6:]) if len(formula_sales) > 6 else 0
    others_brands = sum(f.brand_count for f in formula_sales[6:]) if len(formula_sales) > 6 else 0
    if others_sales > 0:
        others_share = (others_sales / total_sales * 100) if total_sales > 0 else 0
        others_prev = sum(prev_year_formula_sales.get(f.name, 0) for f in formula_sales[6:])
        others_change = format_change(others_sales, others_prev)
        formula_data.append(['Others', f'{others_sales:,}', f'{others_share:.1f}%', others_change, f'{others_brands} brands'])
    
    elements.append(create_table(['Formula', 'Total Sales', '% Share', 'vs Prev Year', 'Brand Count'], formula_data, [100, 80, 60, 70, 70]))
    elements.append(Spacer(1, 15))
    
    # Month-by-Month Breakdown - Real Data
    elements.append(Paragraph('Monthly Sales by Top Formulas', styles['section']))
    monthly_headers = ['Formula'] + [get_month_name(m)[:3] for m in months_to_include]
    col_count = len(monthly_headers)
    col_width = 400 / col_count
    
    if top_formula_names:
        monthly_data = get_monthly_sales_by_formula(year, months_to_include, top_formula_names[:5])
        monthly_formula_data = []
        for formula_name in top_formula_names[:5]:
            row = [formula_name]
            for m in months_to_include:
                qty = monthly_data.get(formula_name, {}).get(m, 0)
                row.append(f'{qty:,}' if qty else '-')
            monthly_formula_data.append(row)
        
        if monthly_formula_data:
            elements.append(create_table(monthly_headers, monthly_formula_data, [col_width] * col_count))
    
    elements.append(Spacer(1, 15))
    
    # Weather Data
    elements.append(Paragraph('Weather Data Summary', styles['section']))
    weather_data = get_weather_data_by_month(year, months_to_include)
    if weather_data:
        weather_summary = []
        for w in weather_data:
            temp_str = f'{w.avg_temp:.1f}°C' if w.avg_temp else 'N/A'
            humidity_str = f'{w.avg_humidity:.0f}%' if w.avg_humidity else 'N/A'
            weather_summary.append([get_month_name(int(w.month))[:3], temp_str, humidity_str])
        elements.append(create_table(['Month', 'Avg Temp', 'Avg Humidity'], weather_summary, [80, 80, 80]))
    else:
        elements.append(Paragraph('No weather data available.', styles['body']))
    
    elements.append(PageBreak())
    
    # Forecast Accuracy by Formula - Real Data
    elements.append(Paragraph('Forecast Accuracy by Formula', styles['section']))
    accuracy_data = get_forecast_accuracy_by_formula(year, months_to_include)
    if accuracy_data:
        forecast_table_data = []
        for acc in accuracy_data[:7]:
            forecast_table_data.append([
                acc['formula'],
                f"{acc['forecasted']:,}",
                f"{acc['actual']:,}",
                f"{acc['accuracy']:.1f}%",
                acc['rating']
            ])
        elements.append(create_table(['Formula', 'Forecasted', 'Actual', 'Accuracy', 'Rating'], forecast_table_data, [100, 85, 85, 70, 80]))
        
        # Overall accuracy
        overall_acc = sum(a['accuracy'] for a in accuracy_data) / len(accuracy_data) if accuracy_data else 0
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f'Average Forecast Accuracy: {overall_acc:.1f}%', styles['success'] if overall_acc >= 85 else styles['warning']))
    
    elements.append(Spacer(1, 15))
    
    # Top Districts by Formula
    elements.append(Paragraph('Top Districts by Formula', styles['section']))
    district_formula_data = []
    for formula_name in top_formula_names[:5]:
        top_districts = db.session.query(
            District.name,
            func.sum(MedicineSales.quantity).label('quantity')
        ).join(MedicineSales, District.id == MedicineSales.district_id
        ).join(Medicine, MedicineSales.medicine_id == Medicine.id
        ).join(Formula, Medicine.formula_id == Formula.id
        ).filter(
            Formula.name == formula_name,
            extract('year', MedicineSales.date) == year,
            extract('month', MedicineSales.date).in_(months_to_include)
        ).group_by(District.id, District.name).order_by(desc('quantity')).limit(2).all()
        
        if len(top_districts) >= 2:
            district_formula_data.append([formula_name, top_districts[0].name, f'{top_districts[0].quantity:,}', top_districts[1].name, f'{top_districts[1].quantity:,}'])
        elif len(top_districts) == 1:
            district_formula_data.append([formula_name, top_districts[0].name, f'{top_districts[0].quantity:,}', '-', '-'])
    
    if district_formula_data:
        elements.append(create_table(['Formula', 'Top District', 'Sales', '2nd District', 'Sales'], district_formula_data, [95, 85, 65, 85, 65]))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph('Formula report auto-generated by MedInsights Pro (Database)', styles['footer']))
    
    doc.build(elements)
    print(f'Generated: {output_path}')


# ==================== REPORT 2: DISTRICT REPORT ====================
def generate_district_report(year=None, district_name=None):
    """Generate District-based report with real database data"""
    if year is None:
        year = datetime.now().year
    if district_name is None:
        district_name = "All_Districts"
    
    output_path = f'reports/District_Report_{district_name.replace(" ", "_")}_{year}.pdf'
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    
    current_date = datetime.now()
    if year == current_date.year:
        months_to_include = list(range(1, current_date.month))
        period_text = f"January - {get_month_name(current_date.month - 1)} {year}" if current_date.month > 1 else "No data yet"
    elif year < current_date.year:
        months_to_include = list(range(1, 13))
        period_text = f"Full Year {year}"
    else:
        months_to_include = []
        period_text = "Future year - no data"
    
    elements.append(Paragraph('AREA PERFORMANCE REPORT', styles['title']))
    elements.append(Paragraph(f'{district_name.replace("_", " ")} - {year}', styles['title']))
    elements.append(Paragraph(f'Period: {period_text} | Generated: {datetime.now().strftime("%B %d, %Y at %H:%M")}', styles['subtitle']))
    
    if not months_to_include:
        elements.append(Paragraph('No data available for this period.', styles['body']))
        doc.build(elements)
        print(f'Generated: {output_path}')
        return
    
    # District Overview - Real Data
    elements.append(Paragraph('Area Performance Overview', styles['section']))
    district_sales = get_sales_by_district(year, months_to_include)
    total_sales = sum(d.total_sales for d in district_sales) if district_sales else 0
    
    # Get previous year sales for comparison
    prev_district_sales = get_previous_year_sales_by_district(year, months_to_include)
    
    overview_data = []
    top_district_names = []
    for rank, d in enumerate(district_sales[:7], 1):
        share = (d.total_sales / total_sales * 100) if total_sales > 0 else 0
        change = format_change(d.total_sales, prev_district_sales.get(d.name, 0))
        overview_data.append([d.name, f'{d.total_sales:,}', f'{share:.1f}%', change, f'#{rank}'])
        top_district_names.append(d.name)
    
    others_sales = sum(d.total_sales for d in district_sales[7:]) if len(district_sales) > 7 else 0
    if others_sales > 0:
        others_share = (others_sales / total_sales * 100) if total_sales > 0 else 0
        others_count = len(district_sales[7:])
        overview_data.append([f'Others ({others_count})', f'{others_sales:,}', f'{others_share:.1f}%', '-', '-'])
    
    elements.append(create_table(['Area', 'Total Sales', 'Market Share', 'vs Prev Year', 'Rank'], overview_data, [95, 80, 75, 70, 45]))

    elements.append(Spacer(1, 15))
    
    # Monthly Trend by District - Real Data
    elements.append(Paragraph('Monthly Sales Trend', styles['section']))
    monthly_headers = ['Area'] + [get_month_name(m)[:3] for m in months_to_include]
    col_count = len(monthly_headers)
    col_width = 420 / col_count
    
    if top_district_names:
        monthly_data = get_monthly_sales_by_district(year, months_to_include, top_district_names[:5])
        monthly_district_data = []
        for district_name in top_district_names[:5]:
            row = [district_name]
            for m in months_to_include:
                qty = monthly_data.get(district_name, {}).get(m, 0)
                row.append(f'{qty:,}' if qty else '-')
            monthly_district_data.append(row)
        
        if monthly_district_data:
            elements.append(create_table(monthly_headers, monthly_district_data, [col_width] * col_count))
    
    elements.append(Spacer(1, 15))
    
    # Top Medicines by District - Real Data
    elements.append(Paragraph('Top Selling Medicines by District', styles['section']))
    top_meds_by_district = get_top_medicines_by_district(year, months_to_include)
    if top_meds_by_district:
        top_meds_data = []
        for item in top_meds_by_district:
            top_meds_data.append([item['district'], item['medicine'], f"{item['quantity']:,}", item['formula']])
        elements.append(create_table(['Area', 'Top Medicine', 'Units Sold', 'Formula'], top_meds_data, [100, 120, 80, 100]))
    
    elements.append(PageBreak())
    
    # Weather Data
    elements.append(Paragraph('Weather Data Summary', styles['section']))
    weather_data = get_weather_data_by_month(year, months_to_include)
    if weather_data:
        weather_table = []
        for w in weather_data:
            temp_str = f'{w.avg_temp:.1f}°C' if w.avg_temp else 'N/A'
            humidity_str = f'{w.avg_humidity:.0f}%' if w.avg_humidity else 'N/A'
            weather_table.append([get_month_name(int(w.month)), temp_str, humidity_str])
        elements.append(create_table(['Month', 'Avg Temperature', 'Avg Humidity'], weather_table, [120, 100, 100]))
    
    elements.append(Spacer(1, 15))
    
    # Forecast Accuracy by District - Real Data
    elements.append(Paragraph('Forecast Accuracy by Area', styles['section']))
    accuracy_data = get_forecast_accuracy_by_district(year, months_to_include)
    if accuracy_data:
        forecast_district_data = []
        for acc in accuracy_data[:6]:
            forecast_district_data.append([
                acc['district'],
                f"{acc['accuracy']:.1f}%",
                f"{acc['mape']:.1f}%",
                f"{acc['forecasted']:,}",
                f"{acc['actual']:,}",
                acc['rating']
            ])
        elements.append(create_table(['Area', 'Accuracy', 'MAPE', 'Forecasted', 'Actual', 'Rating'], forecast_district_data, [90, 60, 55, 75, 75, 70]))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph('District report auto-generated by MedInsights Pro (Database)', styles['footer']))
    
    doc.build(elements)
    print(f'Generated: {output_path}')


# ==================== REPORT 3: COMPREHENSIVE REPORT ====================
def generate_comprehensive_report(year=None):
    """Generate Comprehensive annual report with real database data"""
    if year is None:
        year = datetime.now().year
    
    output_path = f'reports/Comprehensive_Report_{year}.pdf'
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    
    current_date = datetime.now()
    if year == current_date.year:
        months_to_include = list(range(1, current_date.month))
        period_text = f"January - {get_month_name(current_date.month - 1)} {year}" if current_date.month > 1 else "No data yet"
    elif year < current_date.year:
        months_to_include = list(range(1, 13))
        period_text = f"Full Year {year}"
    else:
        months_to_include = []
        period_text = "Future year - no data"
    
    elements.append(Paragraph('COMPREHENSIVE ANNUAL REPORT', styles['title']))
    elements.append(Paragraph(f'MedInsights Pro - {year}', styles['title']))
    elements.append(Paragraph(f'Period: {period_text} | Generated: {datetime.now().strftime("%B %d, %Y at %H:%M")}', styles['subtitle']))
    
    if not months_to_include:
        elements.append(Paragraph('No data available for this period.', styles['body']))
        doc.build(elements)
        print(f'Generated: {output_path}')
        return
    
    # Executive Summary - Real Data
    elements.append(Paragraph('Executive Summary', styles['section']))
    
    total_sales = db.session.query(func.sum(MedicineSales.quantity)).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    total_formulas = db.session.query(func.count(func.distinct(Formula.id))).join(Medicine).join(MedicineSales).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    total_medicines = db.session.query(func.count(func.distinct(Medicine.id))).join(MedicineSales).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    total_districts = db.session.query(func.count(func.distinct(District.id))).join(MedicineSales).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    overall_accuracy = calculate_overall_accuracy(year, months_to_include)

    # Add YoY change for total sales in Executive Summary
    prev_total_sales = get_previous_year_total_sales(year, months_to_include)
    yoy_total_change = format_change(total_sales, prev_total_sales)

    # Generate contextual notes for Executive Summary
    yoy_growth = ((total_sales - prev_total_sales) / prev_total_sales * 100) if prev_total_sales > 0 else 0
    if yoy_growth > 10:
        sales_note = f'Strong growth of {yoy_growth:.1f}%'
    elif yoy_growth > 0:
        sales_note = f'Growth of {yoy_growth:.1f}%'
    elif yoy_growth > -5:
        sales_note = f'Slight decline of {abs(yoy_growth):.1f}%'
    else:
        sales_note = f'Decline of {abs(yoy_growth):.1f}%'
    
    accuracy_status = 'Above 90% target' if overall_accuracy >= 90 else ('Above 85% target' if overall_accuracy >= 85 else 'Needs improvement')
    
    formulas_note = f'{total_formulas} active formulas'
    medicines_note = f'{total_medicines} SKUs tracked'
    districts_note = 'Full coverage' if total_districts >= 10 else f'{total_districts} districts'

    exec_data = [
        ['Total Sales Volume', f'{total_sales:,} units', sales_note],
        ['Total Formulas Tracked', str(total_formulas), formulas_note],
        ['Total Medicines (SKUs)', str(total_medicines), medicines_note],
        ['Districts Covered', str(total_districts), districts_note],
        ['Average Forecast Accuracy', f'{overall_accuracy:.1f}%', accuracy_status],
    ]
    elements.append(create_table(['Metric', 'Value', 'Notes'], exec_data, [160, 110, 150], keep_together=True))
    elements.append(Spacer(1, 15))
    
    # Monthly Performance Overview - Real Data
    elements.append(Paragraph('Monthly Performance Summary', styles['section']))
    monthly_performance = get_monthly_performance(year, months_to_include)
    if monthly_performance:
        monthly_perf_data = []
        for perf in monthly_performance:
            monthly_perf_data.append([
                get_month_name(perf['month']),
                f"{perf['actual_sales']:,}",
                f"{perf['forecasted']:,}",
                f"{perf['accuracy']:.1f}%"
            ])
        elements.append(create_table(['Month', 'Actual Sales', 'Forecasted', 'Accuracy'], monthly_perf_data, [100, 100, 100, 80]))
    
    elements.append(Spacer(1, 15))
    
    # Top Medicines - Real Data (all)
    elements.append(Paragraph('Top Medicines of the Year', styles['section']))
    top_medicines = get_top_medicines(year, months_to_include, limit=None)
    if top_medicines:
        top_meds_data = []
        for rank, med in enumerate(top_medicines, 1):
            share = (med.total_sales / total_sales * 100) if total_sales > 0 else 0
            top_meds_data.append([str(rank), med.brand_name, med.formula_name, f'{med.total_sales:,}', f'{share:.1f}%'])
        elements.append(create_table(['#', 'Medicine', 'Formula', 'Units', 'Share'], top_meds_data, [25, 110, 100, 70, 55]))
    
    elements.append(PageBreak())
    
    # Formula Analysis - Real Data
    elements.append(Paragraph('Formula Performance Analysis', styles['section']))
    formula_accuracy = get_forecast_accuracy_by_formula(year, months_to_include)
    formula_sales = get_sales_by_formula(year, months_to_include)
    
    # Get previous year formula sales for YoY comparison
    prev_formula_sales = get_previous_year_sales_by_formula(year, months_to_include)
    
    if formula_sales:
        formula_data = []
        for f in formula_sales:
            share = (f.total_sales / total_sales * 100) if total_sales > 0 else 0
            accuracy = next((acc['accuracy'] for acc in formula_accuracy if acc['formula'] == f.name), 0)
            change = format_change(f.total_sales, prev_formula_sales.get(f.name, 0))
            formula_data.append([f.name, f'{f.total_sales:,}', f'{share:.1f}%', change, f'{accuracy:.1f}%'])
        elements.append(create_table(['Formula', 'Total Sales', 'Share', 'vs Prev Year', 'Forecast Acc.'], formula_data, [95, 85, 60, 70, 75]))
    
    elements.append(Spacer(1, 15))
    
    # District Performance - Real Data
    elements.append(Paragraph('Area Performance Overview', styles['section']))
    district_accuracy = get_forecast_accuracy_by_district(year, months_to_include)
    district_sales = get_sales_by_district(year, months_to_include)
    
    # Get previous year district sales for YoY comparison
    prev_district_sales = get_previous_year_sales_by_district(year, months_to_include)
    
    if district_sales:
        district_data = []
        for d in district_sales:
            share = (d.total_sales / total_sales * 100) if total_sales > 0 else 0
            accuracy = next((acc['accuracy'] for acc in district_accuracy if acc['district'] == d.name), 0)
            change = format_change(d.total_sales, prev_district_sales.get(d.name, 0))
            district_data.append([d.name, f'{d.total_sales:,}', f'{share:.1f}%', change, f'{accuracy:.1f}%'])
        elements.append(create_table(['Area', 'Sales', 'Share', 'vs Prev Year', 'Forecast Acc.'], district_data, [90, 80, 60, 70, 75]))
    
    elements.append(Spacer(1, 15))
    
    # Weather Summary - Real Data
    elements.append(Paragraph('Weather Data Summary', styles['section']))
    weather_data = get_weather_data_by_month(year, months_to_include)
    if weather_data:
        weather_summary = []
        for w in weather_data:
            temp_str = f'{w.avg_temp:.1f}°C' if w.avg_temp else 'N/A'
            humidity_str = f'{w.avg_humidity:.0f}%' if w.avg_humidity else 'N/A'
            weather_summary.append([get_month_name(int(w.month)), temp_str, humidity_str])
        elements.append(create_table(['Month', 'Avg Temp', 'Avg Humidity'], weather_summary, [100, 100, 100]))
    
    elements.append(PageBreak())
    
    # Forecast Model Performance - Real Data
    elements.append(Paragraph('Forecast Model Performance', styles['section']))
    mape = 100 - overall_accuracy if overall_accuracy > 0 else 0
    monthly_perf = get_monthly_performance(year, months_to_include)
    hits = sum(1 for p in monthly_perf if p['accuracy'] >= 85) if monthly_perf else 0
    total_months = len(monthly_perf) if monthly_perf else 1
    hit_rate = (hits / total_months * 100) if total_months > 0 else 0
    
    model_data = [
        ['Overall MAPE', f'{mape:.1f}%', '< 15%', 'PASS' if mape < 15 else 'REVIEW'],
        ['Overall Accuracy', f'{overall_accuracy:.1f}%', '> 85%', 'PASS' if overall_accuracy > 85 else 'REVIEW'],
        ['Hit Rate (months ≥85%)', f'{hit_rate:.1f}%', '> 70%', 'PASS' if hit_rate > 70 else 'REVIEW'],
    ]
    elements.append(create_table(['Metric', 'Value', 'Target', 'Status'], model_data, [140, 80, 80, 80], keep_together=True))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph('Comprehensive report auto-generated by MedInsights Pro (Database)', styles['footer']))
    
    doc.build(elements)
    print(f'Generated: {output_path}')


# ==================== INDIVIDUAL FORMULA REPORT ====================
def generate_individual_formula_report(year, formula_name, formula_id):
    """Generate individual report for a specific formula"""
    safe_name = formula_name.replace(' ', '_').replace('/', '-')
    output_path = f'reports/formulas/Formula_{safe_name}_{year}.pdf'
    os.makedirs('reports/formulas', exist_ok=True)
    
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    
    current_date = datetime.now()
    if year == current_date.year:
        months_to_include = list(range(1, current_date.month))
        period_text = f"January - {get_month_name(current_date.month - 1)} {year}" if current_date.month > 1 else "No data yet"
    elif year < current_date.year:
        months_to_include = list(range(1, 13))
        period_text = f"Full Year {year}"
    else:
        months_to_include = []
        period_text = "Future year - no data"
    
    elements.append(Paragraph(f'{formula_name.upper()} REPORT', styles['title']))
    elements.append(Paragraph(f'Formula Analysis - {year}', styles['title']))
    elements.append(Paragraph(f'Period: {period_text} | Generated: {datetime.now().strftime("%B %d, %Y at %H:%M")}', styles['subtitle']))
    
    if not months_to_include:
        elements.append(Paragraph('No data available for this period.', styles['body']))
        doc.build(elements)
        return
    
    # Formula Summary
    elements.append(Paragraph('Sales Summary', styles['section']))
    
    total_sales = db.session.query(
        func.sum(MedicineSales.quantity)
    ).join(Medicine).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    # Get previous year sales for YoY comparison
    prev_year_sales = db.session.query(
        func.sum(MedicineSales.quantity)
    ).join(Medicine).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineSales.date) == year - 1,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    brand_count = db.session.query(
        func.count(func.distinct(Medicine.id))
    ).join(MedicineSales).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    # Get overall total for market share
    overall_total = db.session.query(
        func.sum(MedicineSales.quantity)
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 1
    
    market_share = (total_sales / overall_total * 100) if overall_total > 0 else 0
    yoy_change = format_change(total_sales, prev_year_sales)
    
    summary_data = [
        ['Total Units Sold', f'{total_sales:,}'],
        ['vs Previous Year', yoy_change],
        ['Market Share', f'{market_share:.1f}%'],
        ['Number of Brands', str(brand_count)],
    ]
    elements.append(create_table(['Metric', 'Value'], summary_data, [200, 200], keep_together=True))
    elements.append(Spacer(1, 15))
    
    # Monthly Breakdown
    elements.append(Paragraph('Monthly Sales Breakdown', styles['section']))
    monthly_data = db.session.query(
        extract('month', MedicineSales.date).label('month'),
        func.sum(MedicineSales.quantity).label('quantity')
    ).join(Medicine).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(extract('month', MedicineSales.date)).order_by('month').all()
    
    monthly_table = []
    for m in monthly_data:
        monthly_table.append([get_month_name(int(m.month)), f'{m.quantity:,}'])
    
    if monthly_table:
        elements.append(create_table(['Month', 'Units Sold'], monthly_table, [200, 200]))
    elements.append(Spacer(1, 15))
    
    # Top Brands for this Formula
    elements.append(Paragraph('Top Brands', styles['section']))
    top_brands = db.session.query(
        Medicine.brand_name,
        func.sum(MedicineSales.quantity).label('quantity')
    ).join(MedicineSales).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Medicine.id, Medicine.brand_name).order_by(desc('quantity')).limit(10).all()
    
    brands_data = []
    for rank, b in enumerate(top_brands, 1):
        share = (b.quantity / total_sales * 100) if total_sales > 0 else 0
        brands_data.append([str(rank), b.brand_name, f'{b.quantity:,}', f'{share:.1f}%'])
    
    if brands_data:
        elements.append(create_table(['#', 'Brand Name', 'Units Sold', 'Share'], brands_data, [30, 180, 100, 70]))
    elements.append(Spacer(1, 15))
    
    # Sales by District
    elements.append(Paragraph('Sales by District', styles['section']))
    district_sales = db.session.query(
        District.name,
        func.sum(MedicineSales.quantity).label('quantity')
    ).join(MedicineSales).join(Medicine).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(District.id, District.name).order_by(desc('quantity')).all()
    
    # Get previous year sales by district for this formula
    prev_year_district_sales = {}
    prev_districts = db.session.query(
        District.name,
        func.sum(MedicineSales.quantity).label('quantity')
    ).join(MedicineSales).join(Medicine).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineSales.date) == year - 1,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(District.id, District.name).all()
    
    for d in prev_districts:
        prev_year_district_sales[d.name] = d.quantity
    
    district_data = []
    for d in district_sales:
        share = (d.quantity / total_sales * 100) if total_sales > 0 else 0
        change = format_change(d.quantity, prev_year_district_sales.get(d.name, 0))
        district_data.append([d.name, f'{d.quantity:,}', f'{share:.1f}%', change])
    
    if district_data:
        elements.append(create_table(['District', 'Units Sold', 'Share', 'vs Prev Year'], district_data, [115, 95, 70, 80]))
    elements.append(Spacer(1, 15))
    
    # Forecast Accuracy
    elements.append(Paragraph('Forecast Accuracy', styles['section']))
    forecasted = db.session.query(
        func.sum(MedicineForecast.forecasted_quantity)
    ).join(Medicine).filter(
        Medicine.formula_id == formula_id,
        extract('year', MedicineForecast.forecast_date) == year,
        extract('month', MedicineForecast.forecast_date).in_(months_to_include)
    ).scalar() or 0
    
    accuracy = calculate_accuracy(forecasted, total_sales)
    
    accuracy_data = [
        ['Forecasted Units', f'{forecasted:,}'],
        ['Actual Units', f'{total_sales:,}'],
        ['Accuracy', f'{accuracy:.1f}%'],
        ['Rating', get_accuracy_rating(accuracy)],
    ]
    elements.append(create_table(['Metric', 'Value'], accuracy_data, [200, 200], keep_together=True))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f'{formula_name} report auto-generated by MedInsights Pro', styles['footer']))
    
    doc.build(elements)
    print(f'  Generated: {output_path}')


# ==================== INDIVIDUAL DISTRICT REPORT ====================
def generate_individual_district_report(year, district_name, district_id):
    """Generate individual report for a specific district"""
    safe_name = district_name.replace(' ', '_').replace('/', '-')
    output_path = f'reports/districts/District_{safe_name}_{year}.pdf'
    os.makedirs('reports/districts', exist_ok=True)
    
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = get_styles()
    elements = []
    
    current_date = datetime.now()
    if year == current_date.year:
        months_to_include = list(range(1, current_date.month))
        period_text = f"January - {get_month_name(current_date.month - 1)} {year}" if current_date.month > 1 else "No data yet"
    elif year < current_date.year:
        months_to_include = list(range(1, 13))
        period_text = f"Full Year {year}"
    else:
        months_to_include = []
        period_text = "Future year - no data"
    
    elements.append(Paragraph(f'{district_name.upper()} DISTRICT REPORT', styles['title']))
    elements.append(Paragraph('District Analysis - {year}', styles['title']))
    elements.append(Paragraph(f'Period: {period_text} | Generated: {datetime.now().strftime("%B %d, %Y at %H:%M")}', styles['subtitle']))
    
    if not months_to_include:
        elements.append(Paragraph('No data available for this period.', styles['body']))
        doc.build(elements)
        return
    
    # District Summary
    elements.append(Paragraph('Sales Summary', styles['section']))
    
    total_sales = db.session.query(
        func.sum(MedicineSales.quantity)
    ).filter(
        MedicineSales.district_id == district_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    # Get previous year sales for YoY comparison
    prev_year_sales = db.session.query(
        func.sum(MedicineSales.quantity)
    ).filter(
        MedicineSales.district_id == district_id,
        extract('year', MedicineSales.date) == year - 1,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 0
    
    # Get overall total for market share
    overall_total = db.session.query(
        func.sum(MedicineSales.quantity)
    ).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).scalar() or 1
    
    market_share = (total_sales / overall_total * 100) if overall_total > 0 else 0
    yoy_change = format_change(total_sales, prev_year_sales)
    
    # Get rank
    all_districts = db.session.query(
        District.id,
        func.sum(MedicineSales.quantity).label('total')
    ).join(MedicineSales).filter(
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(District.id).order_by(desc('total')).all()
    
    rank = next((i+1 for i, d in enumerate(all_districts) if d.id == district_id), 0)
    
    summary_data = [
        ['Total Units Sold', f'{total_sales:,}'],
        ['vs Previous Year', yoy_change],
        ['Market Share', f'{market_share:.1f}%'],
        ['Area Rank', f'#{rank} of {len(all_districts)}'],
    ]
    elements.append(create_table(['Metric', 'Value'], summary_data, [200, 200], keep_together=True))
    elements.append(Spacer(1, 15))
    
    # Monthly Breakdown
    elements.append(Paragraph('Monthly Sales Breakdown', styles['section']))
    monthly_data = db.session.query(
        extract('month', MedicineSales.date).label('month'),
        func.sum(MedicineSales.quantity).label('quantity')
    ).filter(
        MedicineSales.district_id == district_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(extract('month', MedicineSales.date)).order_by('month').all()
    
    monthly_table = []
    for m in monthly_data:
        monthly_table.append([get_month_name(int(m.month)), f'{m.quantity:,}'])
    
    if monthly_table:
        elements.append(create_table(['Month', 'Units Sold'], monthly_table, [200, 200]))
    elements.append(Spacer(1, 15))
    
    # Top Medicines in this District
    elements.append(Paragraph('Top Medicines', styles['section']))
    top_meds = db.session.query(
        Medicine.brand_name,
        Formula.name.label('formula_name'),
        func.sum(MedicineSales.quantity).label('quantity')
    ).join(MedicineSales).join(Formula).filter(
        MedicineSales.district_id == district_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Medicine.id, Medicine.brand_name, Formula.name).order_by(desc('quantity')).limit(10).all()
    
    meds_data = []
    for rank, m in enumerate(top_meds, 1):
        share = (m.quantity / total_sales * 100) if total_sales > 0 else 0
        meds_data.append([str(rank), m.brand_name, m.formula_name, f'{m.quantity:,}', f'{share:.1f}%'])
    
    if meds_data:
        elements.append(create_table(['#', 'Medicine', 'Formula', 'Units', 'Share'], meds_data, [25, 130, 100, 70, 55]))
    elements.append(Spacer(1, 15))
    
    # Sales by Formula
    elements.append(Paragraph('Sales by Formula', styles['section']))
    formula_sales = db.session.query(
        Formula.name,
        func.sum(MedicineSales.quantity).label('quantity')
    ).select_from(MedicineSales).join(
        Medicine, MedicineSales.medicine_id == Medicine.id
    ).join(
        Formula, Medicine.formula_id == Formula.id
    ).filter(
        MedicineSales.district_id == district_id,
        extract('year', MedicineSales.date) == year,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Formula.id, Formula.name).order_by(desc('quantity')).limit(10).all()
    
    # Get previous year sales by formula for this district
    prev_year_formula_sales = {}
    prev_formulas = db.session.query(
        Formula.name,
        func.sum(MedicineSales.quantity).label('quantity')
    ).select_from(MedicineSales).join(
        Medicine, MedicineSales.medicine_id == Medicine.id
    ).join(
        Formula, Medicine.formula_id == Formula.id
    ).filter(
        MedicineSales.district_id == district_id,
        extract('year', MedicineSales.date) == year - 1,
        extract('month', MedicineSales.date).in_(months_to_include)
    ).group_by(Formula.id, Formula.name).all()
    
    for f in prev_formulas:
        prev_year_formula_sales[f.name] = f.quantity
    
    formula_data = []
    for f in formula_sales:
        share = (f.quantity / total_sales * 100) if total_sales > 0 else 0
        change = format_change(f.quantity, prev_year_formula_sales.get(f.name, 0))
        formula_data.append([f.name, f'{f.quantity:,}', f'{share:.1f}%', change])
    
    if formula_data:
        elements.append(create_table(['Formula', 'Units Sold', 'Share', 'vs Prev Year'], formula_data, [115, 95, 70, 80]))
    elements.append(Spacer(1, 15))
    
    # Forecast Accuracy
    elements.append(Paragraph('Forecast Accuracy', styles['section']))
    forecasted = db.session.query(
        func.sum(MedicineForecast.forecasted_quantity)
    ).filter(
        MedicineForecast.district_id == district_id,
        extract('year', MedicineForecast.forecast_date) == year,
        extract('month', MedicineForecast.forecast_date).in_(months_to_include)
    ).scalar() or 0
    
    accuracy = calculate_accuracy(forecasted, total_sales)
    
    accuracy_data = [
        ['Forecasted Units', f'{forecasted:,}'],
        ['Actual Units', f'{total_sales:,}'],
        ['Accuracy', f'{accuracy:.1f}%'],
        ['Rating', get_accuracy_rating(accuracy)],
    ]
    elements.append(create_table(['Metric', 'Value'], accuracy_data, [200, 200], keep_together=True))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f'{district_name} District report auto-generated by MedInsights Pro', styles['footer']))
    
    doc.build(elements)
    print(f'  Generated: {output_path}')


# ==================== GENERATE ALL INDIVIDUAL REPORTS ====================
def generate_all_individual_formula_reports(year):
    """Generate individual reports for all formulas"""
    print("\nGenerating individual formula reports...")
    
    # Get all formulas that have sales data
    formulas = db.session.query(Formula.id, Formula.name).join(Medicine).join(MedicineSales).filter(
        extract('year', MedicineSales.date) == year
    ).distinct().all()
    
    for formula in formulas:
        generate_individual_formula_report(year, formula.name, formula.id)
    
    print(f"  Total: {len(formulas)} individual formula reports generated")


def generate_all_individual_district_reports(year):
    """Generate individual reports for all districts"""
    print("\nGenerating individual district reports...")
    
    # Get all districts that have sales data
    districts = db.session.query(District.id, District.name).join(MedicineSales).filter(
        extract('year', MedicineSales.date) == year
    ).distinct().all()
    
    for district in districts:
        generate_individual_district_report(year, district.name, district.id)
    
    print(f"  Total: {len(districts)} individual district reports generated")


# ==================== MAIN ====================
def main():
    """Main entry point - creates Flask app context and generates reports"""
    os.makedirs('reports', exist_ok=True)
    os.makedirs('reports/formulas', exist_ok=True)
    os.makedirs('reports/districts', exist_ok=True)
    
    if len(sys.argv) > 1:
        try:
            year = int(sys.argv[1])
        except ValueError:
            print(f"Invalid year: {sys.argv[1]}. Using 2024.")
            year = 2024
    else:
        year = 2024
    
    print(f"Generating database-driven reports for year: {year}")
    print("=" * 50)
    
    app = create_app()
    
    with app.app_context():
        print("Connected to database. Querying real data...")
        print()
        
        # Summary reports
        print("Generating summary reports...")
        generate_formula_report(year)
        generate_district_report(year)
        generate_comprehensive_report(year)
        
        # Individual reports
        generate_all_individual_formula_reports(year)
        generate_all_individual_district_reports(year)
    
    print()
    print("=" * 50)
    print("All reports generated in 'reports/' folder!")
    print(f"\nSummary Reports for {year}:")
    print(f"  - Formula_Report_{year}.pdf")
    print(f"  - District_Report_All_Districts_{year}.pdf")
    print(f"  - Comprehensive_Report_{year}.pdf")
    print(f"\nIndividual Reports:")
    print(f"  - reports/formulas/  (individual formula reports)")
    print(f"  - reports/districts/ (individual district reports)")
    print("\nUsage: python generate_all_reports.py [year]")
    print("  Example: python generate_all_reports.py 2024")


if __name__ == '__main__':
    main()
