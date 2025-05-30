import { useState } from 'react';
import { api } from '~/trpc/react';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const sendEmailMutation = api.email.send.useMutation({
    onSuccess: (data) => {
      setMessage(`✅ ${data.message} (ID: ${data.messageId})`);
    },
    onError: (error) => {
      setMessage(`❌ Eroare: ${error.message}`);
    },
  });

  const sendTestEmail = () => {
    if (!email) {
      setMessage('❌ Te rog introdu un email valid');
      return;
    }

    setMessage('');
    sendEmailMutation.mutate({
      to: email,
      subject: 'Test email din GiftHub',
      html: '<h1>Salut!</h1><p>Acesta este un test email din aplicația GiftHub.</p><p>Dacă primești acest email, înseamnă că integrarea Nodemailer funcționează! 🎉</p>',
      text: 'Salut! Acesta este un test email din aplicația GiftHub. Dacă primești acest email, înseamnă că integrarea Nodemailer funcționează!'
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Test Email</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email destinatar:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplu@gmail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={sendTestEmail}
          disabled={sendEmailMutation.isPending || !email}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {sendEmailMutation.isPending ? 'Se trimite...' : 'Trimite email de test'}
        </button>
        
        {message && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}