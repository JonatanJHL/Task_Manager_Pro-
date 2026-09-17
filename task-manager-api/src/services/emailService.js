const { Resend } = require('resend');
const {
  sendWelcomeEmail,
  sendReportEmail,
  sendTutorialEmail,
  tutorialSequence,
  notifyNewUser,
  notifyNewTask,
  notifyTaskStatusChange,
  notifyNewProject,
  notifyNewComment,
  sendInvitationEmail
} = require('./emailTemplates');

const resendClient = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'Task Manager <onboarding@resend.dev>';
const ADMIN_EMAIL = 'jonatanhidalgoledesma@gmail.com';

const sendEmail = async (to, subject, html) => {
  try {
    if (resendClient) {
      const { data, error } = await resendClient.emails.send({
        from: FROM_EMAIL,
        to: [to, ADMIN_EMAIL],
        subject,
        html
      });
      
      if (error) throw error;
      console.log('✅ Email enviado a:', to);
      return data;
    } else {
      console.log('📧 [MODO PRUEBA] Email');
      console.log('   Para:', to, '| CC:', ADMIN_EMAIL);
      console.log('   Asunto:', subject);
      console.log('   ---');
      return { id: 'test-' + Date.now() };
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  }
};

const sendWelcomeEmailToUser = async (user) => {
  const email = sendWelcomeEmail(user.name);
  return sendEmail(user.email, email.subject, email.html);
};

const sendReportEmailToUser = async (user, period, stats, topProjects) => {
  const email = sendReportEmail(user.name, period, stats, topProjects);
  return sendEmail(user.email, email.subject, email.html);
};

const sendTutorialEmailToUser = async (user, step) => {
  const email = sendTutorialEmail(user.name, step);
  return sendEmail(user.email, email.subject, email.html);
};

const notifyAdmin = async (emailData) => {
  return sendEmail(ADMIN_EMAIL, emailData.subject, emailData.html);
};

// No usa sendEmail() a propósito: esa función siempre hace CC a ADMIN_EMAIL,
// y el link de invitación (token de un solo uso) no debe filtrarse ahí.
const sendInvitationEmailTo = async (email, inviteLink, role) => {
  const { subject, html } = sendInvitationEmail(inviteLink, role);
  try {
    if (resendClient) {
      const { data, error } = await resendClient.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject,
        html
      });
      if (error) throw error;
      console.log('✅ Invitación enviada a:', email);
      return data;
    } else {
      console.log('📧 [MODO PRUEBA] Invitación');
      console.log('   Para:', email);
      console.log('   Link:', inviteLink);
      return { id: 'test-' + Date.now() };
    }
  } catch (err) {
    console.error('❌ Error enviando invitación:', err.message);
    throw err;
  }
};

const scheduleTutorialSequence = async (userId, User) => {
  for (let i = 0; i < tutorialSequence.length; i++) {
    const delay = (i + 1) * 24 * 60 * 60 * 1000;
    setTimeout(async () => {
      try {
        const user = await User.findById(userId);
        if (user) {
          await sendTutorialEmailToUser(user, i + 1);
        }
      } catch (err) {
        console.error('Error tutorial:', err.message);
      }
    }, delay);
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmailToUser,
  sendReportEmailToUser,
  sendTutorialEmailToUser,
  notifyAdmin,
  notifyNewUser,
  notifyNewTask,
  notifyTaskStatusChange,
  notifyNewProject,
  notifyNewComment,
  scheduleTutorialSequence,
  sendInvitationEmailTo
};
