"""District management routes"""
from flask import Blueprint, request, jsonify
from database import db
from models import District, MedicineSales, Formula, Medicine

districts_bp = Blueprint('districts', __name__)


@districts_bp.route('/districts', methods=['GET'])
def get_districts():
    """Get all districts"""
    districts = District.query.order_by(District.name.asc()).all()
    return jsonify([d.to_dict() for d in districts]), 200


@districts_bp.route('/districts/<int:id>', methods=['GET'])
def get_district(id):
    """Get a specific district"""
    district = District.query.get_or_404(id)
    return jsonify(district.to_dict()), 200


@districts_bp.route('/districts', methods=['POST'])
def create_district():
    """
    Create a new district
    Expected JSON:
    {
        "name": "Karachi Central",
        "areaCode": "KC001"
    }
    """
    data = request.get_json()
    
    # Check if district already exists
    existing = District.query.filter_by(name=data.get('name')).first()
    if existing:
        return jsonify({"error": "District already exists"}), 400
    
    district = District(
        name=data.get('name'),
        area_code=data.get('areaCode')
    )
    db.session.add(district)
    db.session.commit()
    
    return jsonify({
        "message": "District created successfully",
        "district": district.to_dict()
    }), 201


@districts_bp.route('/districts/<int:id>', methods=['PUT'])
def update_district(id):
    """Update district"""
    district = District.query.get_or_404(id)
    data = request.get_json()
    
    if 'name' in data:
        district.name = data['name']
    if 'areaCode' in data:
        district.area_code = data['areaCode']
    
    db.session.commit()
    
    return jsonify({
        "message": "District updated successfully",
        "district": district.to_dict()
    }), 200


@districts_bp.route('/districts/<int:id>', methods=['DELETE'])
def delete_district(id):
    """Delete district (will fail if it has associated data)"""
    district = District.query.get_or_404(id)
    db.session.delete(district)
    db.session.commit()
    
    return jsonify({"message": "District deleted successfully"}), 200


@districts_bp.route('/districts/<int:district_id>/formulas', methods=['GET'])
def get_district_formulas(district_id):
    """Get all formulas that have medicines sold in this district"""
    district = District.query.get_or_404(district_id)
    
    # Get unique formula IDs from medicines that have sales in this district
    formula_ids = db.session.query(Medicine.formula_id).distinct().\
        join(MedicineSales).filter(MedicineSales.district_id == district_id).all()
    
    formulas = Formula.query.filter(Formula.id.in_([fid[0] for fid in formula_ids])).all()
    
    return jsonify([f.to_dict() for f in formulas]), 200


@districts_bp.route('/districts/<int:district_id>/formulas/<int:formula_id>/medicines', methods=['GET'])
def get_district_formula_medicines(district_id, formula_id):
    """Get all medicines of a specific formula sold in this district"""
    district = District.query.get_or_404(district_id)
    formula = Formula.query.get_or_404(formula_id)
    
    # Get medicines of this formula that have sales in this district
    medicine_ids = db.session.query(MedicineSales.medicine_id).distinct().\
        filter(MedicineSales.district_id == district_id).all()
    
    medicines = Medicine.query.filter(
        Medicine.formula_id == formula_id,
        Medicine.id.in_([mid[0] for mid in medicine_ids])
    ).all()
    
    return jsonify([m.to_dict() for m in medicines]), 200
