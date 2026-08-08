interface IInvitationTemplate {
  inviterName: string;
  workspaceName: string;
  inviteLink: string;
}

export const invitationTemplate = ({
  inviterName,
  workspaceName,
  inviteLink,
}: IInvitationTemplate) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:24px; border:1px solid #e5e5e5; border-radius:8px;">
      <h2 style="color:#2563eb;">You're Invited to Join FlowDesk</h2>

      <p>
        <strong>${inviterName}</strong> invited you to join the workspace
        <strong>${workspaceName}</strong>.
      </p>

      <p>
        Click the button below to accept the invitation.
      </p>

      <a
        href="${inviteLink}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:#fff;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Accept Invitation
      </a>

      <p style="margin-top:24px; color:#666;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>

      <hr />

      <p style="font-size:12px; color:#999;">
        FlowDesk Team
      </p>
    </div>
  `;
};
