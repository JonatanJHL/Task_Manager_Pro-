const crypto = require('crypto');
const Invitation = require('../models/invitationModel');
const emailService = require('../services/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EXPIRATION_DAYS = 7;

const getStatus = (invitation) => {
  if (invitation.used_at) return 'used';
  if (new Date(invitation.expires_at) < new Date()) return 'expired';
  return 'pending';
};

const createInvitation = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !['admin', 'guest'].includes(role)) {
      return res.status(400).json({ error: 'email y role (admin|guest) son requeridos' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    const id = await Invitation.create({
      token,
      email,
      role,
      invited_by: req.user.id,
      expires_at: expiresAt,
    });

    const inviteLink = `${FRONTEND_URL}/register?token=${token}`;
    emailService.sendInvitationEmailTo(email, inviteLink, role).catch(err => {
      console.error('Error enviando invitación:', err.message);
    });

    res.status(201).json({ id, message: 'Invitación creada' });
  } catch (err) {
    console.error('Error createInvitation:', err);
    res.status(500).json({ error: 'Error al crear invitación' });
  }
};

const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAll();
    res.json(invitations.map(inv => ({ ...inv, status: getStatus(inv) })));
  } catch (err) {
    console.error('Error getInvitations:', err);
    res.status(500).json({ error: 'Error al obtener invitaciones' });
  }
};

const deleteInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ error: 'Invitación no encontrada' });
    if (invitation.used_at) return res.status(400).json({ error: 'No se puede revocar una invitación ya usada' });

    await Invitation.remove(req.params.id);
    res.json({ message: 'Invitación revocada' });
  } catch (err) {
    console.error('Error deleteInvitation:', err);
    res.status(500).json({ error: 'Error al revocar invitación' });
  }
};

module.exports = { createInvitation, getInvitations, deleteInvitation };
