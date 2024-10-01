export const resetCodes = new Map<string, { code: string; expiresAt: Date }>();
export const resetTokens = new Map<
  string,
  { email: string; expiresAt: Date }
>();
export const resetCodeMailOptions = {
  text: (code: string) => `Olá,
  
  Recebemos uma solicitação para redefinir sua senha no Document Viewer. Use o código abaixo para concluir o processo de redefinição de senha:
  
  Código de redefinição: ${code}
  
  Se você não solicitou esta alteração, por favor, ignore este email.
  
  Atenciosamente,
  Equipe Document Viewer`,

  html: (code: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #2c3e50; text-align: center;">Redefinição de Senha</h2>
      <p style="font-size: 16px; color: #555;">Olá,</p>
      <p style="font-size: 16px; color: #555;">Recebemos uma solicitação para redefinir sua senha no <strong>Document Viewer</strong>. Use o código abaixo para concluir o processo de redefinição de senha:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 22px; font-weight: bold; color: #007bff; background-color: #e7f3ff; padding: 10px 20px; border-radius: 5px; display: inline-block;">${code}</span>
      </div>
      <p style="font-size: 16px; color: #555;">Se você não solicitou esta alteração, por favor, ignore este email.</p>
      <br/>
      <p style="font-size: 16px; color: #555;">Atenciosamente,</p>
      <p style="font-size: 16px; color: #555; font-weight: bold;">Equipe Document Viewer</p>
      <hr style="border: none; height: 1px; background-color: #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Document Viewer. Todos os direitos reservados.</p>
    </div>`,
};
