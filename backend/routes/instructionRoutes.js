const express = require('express');
const InstructionController = require('../controllers/instructionController');
const { checkDatabaseConnection } = require('../middleware/databaseCheck');

const router = express.Router();

// SAP BP Master Instructions CRUD routes
router.get('/sap_bp_master_instructions', InstructionController.getAllInstructions);
router.get('/sap_bp_master_instructions/:sapFieldName', InstructionController.getInstructionBySapFieldName);
router.post('/sap_bp_master_instructions', InstructionController.createInstruction);
router.put('/sap_bp_master_instructions/:sapFieldName', InstructionController.updateInstruction);
router.delete('/sap_bp_master_instructions/:sapFieldName', InstructionController.deleteInstruction);

// Category-based instruction routes (with database check)
router.get('/instructions/:category', checkDatabaseConnection, InstructionController.getInstructionsByCategory);
router.post('/instructions/:category', checkDatabaseConnection, InstructionController.createFieldInstructionByCategory);
router.post('/validate/:category', checkDatabaseConnection, InstructionController.validateData);
router.get('/download-sample/:category', checkDatabaseConnection, InstructionController.generateSampleData);

// Debug route
router.get('/debug/tables', checkDatabaseConnection, InstructionController.getTableNames);

module.exports = router;
