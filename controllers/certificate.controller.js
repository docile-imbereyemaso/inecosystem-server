import Certificate from '../models/Certificate.js';

// ADD CERTIFICATE (for individual users)
export const addCertificate = async (req, res) => {
  try {
    const { 
      name, issuing_organization, certificate_type, 
      issue_date, expiry_date, credential_id, description, skills 
    } = req.body;

    // Validation
    if (!name || !issuing_organization || !certificate_type || !issue_date) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, issuing organization, certificate type, and issue date are required" 
      });
    }

    // Check if user is individual
    if (req.user.user_type !== 'individual') {
      return res.status(403).json({ 
        success: false, 
        message: "Only individual users can add certificates" 
      });
    }

    const certificate = await Certificate.create({
      user_id: req.user.user_id,
      name,
      issuing_organization,
      certificate_type,
      issue_date,
      expiry_date,
      credential_id,
      description,
      skills: skills || []
    });

    res.status(201).json({ 
      success: true, 
      certificate,
      message: "Certificate added successfully" 
    });
  } catch (error) {
    console.error("Add certificate error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error adding certificate", 
      error: error.message 
    });
  }
};

// GET USER CERTIFICATES
export const getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { user_id: req.user.user_id },
      order: [['issue_date', 'DESC']]
    });

    res.status(200).json({ 
      success: true, 
      certificates 
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching certificates" 
    });
  }
};

// UPDATE CERTIFICATE
export const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const certificate = await Certificate.findOne({
      where: { certificate_id: id, user_id: req.user.user_id }
    });

    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: "Certificate not found" 
      });
    }

    await certificate.update(updates);

    res.status(200).json({ 
      success: true, 
      certificate,
      message: "Certificate updated successfully" 
    });
  } catch (error) {
    console.error("Update certificate error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating certificate", 
      error: error.message 
    });
  }
};

// DELETE CERTIFICATE
export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findOne({
      where: { certificate_id: id, user_id: req.user.user_id }
    });

    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: "Certificate not found" 
      });
    }

    await certificate.destroy();

    res.status(200).json({ 
      success: true, 
      message: "Certificate deleted successfully" 
    });
  } catch (error) {
    console.error("Delete certificate error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error deleting certificate", 
      error: error.message 
    });
  }
};