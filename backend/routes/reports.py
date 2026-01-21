"""Report generation routes - PDF reports with role-based access control"""
from flask import Blueprint, request, jsonify, send_file, make_response
from middleware.auth import require_role
from database import db
from models import MedicineSales, MedicineForecast, Formula, District
from sqlalchemy import func, extract, distinct
import os
import sys
from io import BytesIO
from datetime import datetime
from generate_all_reports import generate_district_report

# Add parent directory for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

reports_bp = Blueprint('reports', __name__)


@reports_bp.after_request
def add_cors_headers(response):
    """Add CORS headers to all responses from this blueprint"""
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Type'
    return response


def send_pdf_with_cors(file_path, download_name):
    """Helper function to send PDF files with proper CORS headers"""
    response = make_response(send_file(
        file_path,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=download_name
    ))
    return response


@reports_bp.route('/reports/available-years', methods=['GET'])
@require_role(['admin', 'analyst'])
def get_available_years(**kwargs):
    """
    Get list of years that have forecast data in the database.
    Only accessible by admin and analyst roles.
    
    Returns:
        JSON with list of years sorted descending
    """
    try:
        # Get distinct years from MedicineForecast
        forecast_years = db.session.query(
            distinct(extract('year', MedicineForecast.forecast_date))
        ).filter(MedicineForecast.forecast_date.isnot(None)).all()
        
        # Get distinct years from MedicineSales as fallback
        sales_years = db.session.query(
            distinct(extract('year', MedicineSales.date))
        ).filter(MedicineSales.date.isnot(None)).all()
        
        # Combine and sort years
        all_years = set()
        for (year,) in forecast_years:
            if year:
                all_years.add(int(year))
        for (year,) in sales_years:
            if year:
                all_years.add(int(year))
        
        years_list = sorted(list(all_years), reverse=True)
        
        return jsonify({
            'years': years_list,
            'count': len(years_list),
            'default': years_list[0] if years_list else datetime.now().year
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve available years: {str(e)}'}), 500


@reports_bp.route('/reports/comprehensive', methods=['GET'])
@require_role(['admin', 'analyst'])
def generate_comprehensive_report_api(**kwargs):
    """
    Generate comprehensive annual report PDF.
    Only accessible by admin and analyst roles.
    
    Query params:
        - year: Year for the report (default: current year)
    
    Returns:
        PDF file download
    """
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Import report generation function
        from generate_all_reports import generate_comprehensive_report
        
        # Ensure reports directory exists
        os.makedirs('reports', exist_ok=True)
        
        # Generate the report
        print(f"Generating comprehensive report for year: {year}")
        generate_comprehensive_report(year)
        
        # Send the file
        report_path = f'reports/Comprehensive_Report_{year}.pdf'
        if os.path.exists(report_path):
            print(f"Report generated successfully: {report_path}")
            return send_pdf_with_cors(report_path, f'Comprehensive_Report_{year}.pdf')
        else:
            print(f"ERROR: Report file not found at {report_path}")
            return jsonify({'error': 'Report generation failed - file not created'}), 500
            
    except Exception as e:
        import traceback
        print(f"ERROR generating comprehensive report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Failed to generate comprehensive report: {str(e)}'}), 500


@reports_bp.route('/reports/formula/<int:formula_id>', methods=['GET'])
@require_role(['admin', 'analyst'])
def generate_formula_report_api(formula_id, **kwargs):
    """
    Generate individual formula report PDF.
    Only accessible by admin and analyst roles.
    
    Path params:
        - formula_id: ID of the formula
    
    Query params:
        - year: Year for the report (default: current year)
    
    Returns:
        PDF file download
    """
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Get formula info
        formula = Formula.query.get(formula_id)
        if not formula:
            return jsonify({'error': 'Formula not found'}), 404
        
        # Import report generation function
        from generate_all_reports import generate_individual_formula_report
        
        # Ensure reports directory exists
        os.makedirs('reports/formulas', exist_ok=True)
        
        # Generate the report
        generate_individual_formula_report(year, formula.name, formula.id)
        
        # Send the file
        safe_name = formula.name.replace(' ', '_').replace('/', '-')
        report_path = f'reports/formulas/Formula_{safe_name}_{year}.pdf'
        
        if os.path.exists(report_path):
            return send_pdf_with_cors(report_path, f'Formula_{safe_name}_{year}.pdf')
        else:
            return jsonify({'error': 'Report generation failed - file not created'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to generate formula report: {str(e)}'}), 500


@reports_bp.route('/reports/area/<int:area_id>', methods=['GET'])
@require_role(['admin', 'analyst'])
def generate_area_report_api(area_id, **kwargs):
    """
    Generate individual area (district) report PDF.
    Only accessible by admin and analyst roles.
    
    Path params:
        - area_id: ID of the district/area
    
    Query params:
        - year: Year for the report (default: current year)
    
    Returns:
        PDF file download
    """
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Get district info
        district = District.query.get(area_id)
        if not district:
            return jsonify({'error': 'Area not found'}), 404
        
        # Import report generation function
        from generate_all_reports import generate_individual_district_report
        
        # Ensure reports directory exists
        os.makedirs('reports/districts', exist_ok=True)
        
        # Generate the report
        generate_individual_district_report(year, district.name, district.id)
        
        # Send the file
        safe_name = district.name.replace(' ', '_').replace('/', '-')
        report_path = f'reports/districts/District_{safe_name}_{year}.pdf'
        
        if os.path.exists(report_path):
            return send_pdf_with_cors(report_path, f'Area_{safe_name}_{year}.pdf')
        else:
            return jsonify({'error': 'Report generation failed - file not created'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to generate area report: {str(e)}'}), 500


@reports_bp.route('/reports/formula-summary', methods=['GET'])
@require_role(['admin', 'analyst'])
def generate_formula_summary_report_api(**kwargs):
    """
    Generate formula summary report PDF (all formulas).
    Only accessible by admin and analyst roles.
    
    Query params:
        - year: Year for the report (default: current year)
    
    Returns:
        PDF file download
    """
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Import report generation function
        from generate_all_reports import generate_formula_report
        
        # Ensure reports directory exists
        os.makedirs('reports', exist_ok=True)
        
        # Generate the report
        print(f"Generating formula summary report for year: {year}")
        generate_formula_report(year)
        
        # Send the file
        report_path = f'reports/Formula_Report_{year}.pdf'
        if os.path.exists(report_path):
            print(f"Formula report generated successfully: {report_path}")
            return send_pdf_with_cors(report_path, f'Formula_Summary_Report_{year}.pdf')
        else:
            print(f"ERROR: Formula report file not found at {report_path}")
            return jsonify({'error': 'Report generation failed - file not created'}), 500
            
    except Exception as e:
        import traceback
        print(f"ERROR generating formula summary report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Failed to generate formula summary report: {str(e)}'}), 500


@reports_bp.route('/reports/area-summary', methods=['GET'])
@require_role(['admin', 'analyst'])
def generate_area_summary_report_api(**kwargs):
    """
    Generate area (district) summary report PDF (all areas).
    Only accessible by admin and analyst roles.
    
    Query params:
        - year: Year for the report (default: current year)
    
    Returns:
        PDF file download
    """
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Import report generation function
        print(f"Generating area summary report for year: {year}")
        generate_district_report(year)
        
        # Send the file
        report_path = f'reports/District_Report_All_Districts_{year}.pdf'
        if os.path.exists(report_path):
            print(f"Area report generated successfully: {report_path}")
            return send_pdf_with_cors(report_path, f'Area_Summary_Report_{year}.pdf')
        else:
            print(f"ERROR: Area report file not found at {report_path}")
            return jsonify({'error': 'Report generation failed - file not created'}), 500
            
    except Exception as e:
        import traceback
        print(f"ERROR generating area summary report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Failed to generate area summary report: {str(e)}'}), 500


@reports_bp.route('/reports/formulas-list', methods=['GET'])
@require_role(['admin', 'analyst'])
def get_formulas_for_reports(**kwargs):
    """
    Get list of formulas with IDs for report generation dropdown.
    Only accessible by admin and analyst roles.
    
    Returns:
        JSON with list of formula objects (id, name)
    """
    try:
        formulas = Formula.query.order_by(Formula.name).all()
        
        return jsonify({
            'formulas': [{'id': f.id, 'name': f.name} for f in formulas],
            'count': len(formulas)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve formulas: {str(e)}'}), 500


@reports_bp.route('/reports/areas-list', methods=['GET'])
@require_role(['admin', 'analyst'])
def get_areas_for_reports(**kwargs):
    """
    Get list of areas (districts) with IDs for report generation dropdown.
    Only accessible by admin and analyst roles.
    
    Returns:
        JSON with list of area objects (id, name)
    """
    try:
        districts = District.query.order_by(District.name).all()
        
        return jsonify({
            'areas': [{'id': d.id, 'name': d.name} for d in districts],
            'count': len(districts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve areas: {str(e)}'}), 500
