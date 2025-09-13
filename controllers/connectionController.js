import Connection from '../models/Connection.js';
import Notification from '../models/Notification.js';
import { createNotification } from '../utils/helpers.js';
// POST /api/connections — create new connection
import User from '../models/User.js';

export const createConnection = async (req, res) => {
  const { user_id, connected_user_id } = req.body;

  if (user_id === connected_user_id) {
    return res.status(400).json({ message: "Cannot connect to yourself." });
  }

  try {
    // Check if both companies exist
    const targetCompany = await User.findByPk(user_id);
    const senderCompany = await User.findByPk(connected_user_id);

    if (!targetCompany || !senderCompany) {
      return res.status(404).json({ message: "One or both companies not found." });
    }

    // Prevent duplicate connections
    const existing = await Connection.findOne({
      where: { user_id, connected_user_id }
    });

    if (existing) {
      return res.status(409).json({ message: "Connection already exists." });
    }

    // Create connection (initially as pending — you can change to accepted if auto-approve)
    const connection = await Connection.create({
      user_id,
      connected_user_id,
      status: 'accepted'
    });

    // Notify the target company (user_id)
    await createNotification({
      title: "New Connection Established",
      message: `Hi, You are now connected with ${senderCompany.company_name} (ID: ${senderCompany.user_id}).`,
      recipient_type: 'user',
      recipient_id: user_id,
      data: { connection_id: connection.connection_id }
    });

    // Notify the sender company (connected_user_id)
    await createNotification({
      title: "New Connection Established",
      message: `Hello, You are now connected with -${targetCompany.company_name}-(ID: ${targetCompany.user_id})-private sector`,
      recipient_type: 'user',
      recipient_id: connected_user_id,
      data: { connection_id: connection.connection_id }
    });

    res.status(201).json({
      success: true,
      message: 'Connection created successfully.',
      data: connection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create connection.",
      error: error.message 
    });
  }
};


// PATCH /api/connections/:id — update status (accept/reject)
export const updateConnectionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' or 'rejected'

  try {
    const connection = await Connection.findByPk(id);

    if (!connection) {
      return res.status(404).json({ message: "Connection not found." });
    }

    connection.status = status;
    await connection.save();

    res.json({
      success: true,
      message: `Connection ${status}`,
      data: connection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update connection." });
  }
};

// GET /api/connections/user/:user_id — all connections for a user



export const getUserConnections = async (req, res) => {
  const { user_id } = req.params;

  try {
    const connections = await Connection.findAll({
      where: {
       user_id,            // I am the company being connected to
        status: 'accepted'  // only accepted connections
      },
      include: [
        {
          model: User,
          as: 'connected_user',   // the company that connected to me
          attributes: [
            'user_id',
           
            'company_name',
            'email',
            'phone',
            'first_name',
            'last_name'
          ]
        }
      ]
    });

    

    res.json({ success: true, data: connections });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch connected companies.",
      error: error.message
    });
  }
};


export const getPrivateConnections = async (req, res) => {
  const { user_id } = req.params;

  try {
    const connections = await Connection.findAll({
      where: {
        connected_user_id: user_id,            // I am the company being connected to
        status: 'accepted'  // only accepted connections
      },
      attributes: ['connection_id', 'user_id', 'connected_user_id', 'status', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'connected_user',   // the company that connected to me
          attributes: [
            'user_id',
           
            'company_name',
            'email',
            'phone',
            'first_name',
            'last_name'
          ]
        }
      ]
    });



    res.json({ success: true, data: connections });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch connected companies.",
      error: error.message
    });
  }
};

// GET /api/connections — all connections (admin use)
export const getAllConnections = async (req, res) => {
  try {
    const connections = await Connection.findAll({
      include: [
        { model: User, as: 'requester', attributes: ['user_id','first_name','last_name'] },
        { model: User, as: 'connectedUser', attributes: ['user_id','first_name','last_name'] },
      ]
    });

    res.json({ success: true, data: connections });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all connections." });
  }
};
