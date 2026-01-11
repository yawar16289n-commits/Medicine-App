"""Formula management routes"""
from flask import Blueprint, request, jsonify
from database import db
from models import Formula, Medicine, MedicineSales, District

formulas_bp = Blueprint('formulas', __name__)


@formulas_bp.route('/formulas', methods=['GET'])
def get_formulas():
    """Get all formulas"""
    formulas = Formula.query.order_by(Formula.name.asc()).all()
    return jsonify([f.to_dict() for f in formulas]), 200


@formulas_bp.route('/formulas/<int:id>', methods=['GET'])
def get_formula(id):
    """Get a specific formula with its medicines"""
    formula = Formula.query.get_or_404(id)
    medicines = Medicine.query.filter_by(formula_id=id).all()
    
    result = formula.to_dict()
    result['medicines'] = [m.to_dict() for m in medicines]
    
    return jsonify(result), 200


@formulas_bp.route('/formulas', methods=['POST'])
def create_formula():
    """
    Create a new formula
    Expected JSON:
    {
        "name": "Paracetamol"
    }
    """
    data = request.get_json()
    
    # Validate required field
    if not data.get('name'):
        return jsonify({"error": "Formula name is required"}), 400
    
    # Check if formula already exists
    existing = Formula.query.filter_by(name=data.get('name')).first()
    if existing:
        return jsonify({"error": f"Formula '{data.get('name')}' already exists"}), 409
    
    formula = Formula(
        name=data.get('name')
    )
    db.session.add(formula)
    db.session.commit()
    
    return jsonify({
        "message": "Formula created successfully",
        "formula": formula.to_dict()
    }), 201


@formulas_bp.route('/formulas/<int:id>', methods=['PUT'])
def update_formula(id):
    """Update formula"""
    formula = Formula.query.get_or_404(id)
    data = request.get_json()
    
    # Check if name is being changed to an existing name
    if 'name' in data and data['name'] != formula.name:
        existing = Formula.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({"error": f"Formula '{data['name']}' already exists"}), 409
        formula.name = data['name']
    
    db.session.commit()
    
    return jsonify({
        "message": "Formula updated successfully",
        "formula": formula.to_dict()
    }), 200


@formulas_bp.route('/formulas/<int:id>', methods=['DELETE'])
def delete_formula(id):
    """Delete formula (will fail if it has associated medicines)"""
    formula = Formula.query.get_or_404(id)
    db.session.delete(formula)
    db.session.commit()
    
    return jsonify({"message": "Formula deleted successfully"}), 200


@formulas_bp.route('/formulas/<int:formula_id>/districts', methods=['GET'])
def get_formula_districts(formula_id):
    """Get all districts where this formula is sold"""
    formula = Formula.query.get_or_404(formula_id)
    
    # Get unique district IDs from medicines of this formula that have sales
    district_ids = db.session.query(MedicineSales.district_id).distinct().\
        join(Medicine).filter(Medicine.formula_id == formula_id).all()
    
    districts = District.query.filter(District.id.in_([did[0] for did in district_ids])).all()
    
    return jsonify([d.to_dict() for d in districts]), 200
