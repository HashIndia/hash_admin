import { useState } from 'react';
import { X, Mail, Send, Users, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { broadcastAPI } from '../services/api';
import toast from 'react-hot-toast';

const BroadcastModal = ({ isOpen, onClose, selectedCustomers = [], type = 'all' }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    htmlContent: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    try {
      setIsLoading(true);
      
      let response;
      if (type === 'selected' && selectedCustomers.length > 0) {
        // Send to selected customers
        const customerEmails = selectedCustomers.map(customer => customer.email).filter(Boolean);
        response = await broadcastAPI.sendTargetedEmail({
          ...emailData,
          recipients: customerEmails
        });
      } else {
        // Send to all customers
        response = await broadcastAPI.sendBroadcastEmail(emailData);
      }
      
      toast.success(`Email sent successfully to ${response.data.successCount} customers!`);
      
      if (response.data.failCount > 0) {
        toast.error(`Failed to send to ${response.data.failCount} customers`);
      }
      
      // Reset form and close modal
      setEmailData({ subject: '', message: '', htmlContent: '' });
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const recipientCount = type === 'selected' ? selectedCustomers.length : 'all';
  const recipientText = type === 'selected' 
    ? `${selectedCustomers.length} selected customers` 
    : 'all active customers';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Send Email Broadcast</h2>
                <p className="text-sm text-gray-500">
                  Send email to {recipientText}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Recipient Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Recipients: {recipientText}
              </span>
            </div>
            {type === 'selected' && selectedCustomers.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-blue-700 mb-1">Selected customers:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedCustomers.slice(0, 5).map((customer, index) => (
                    <span
                      key={customer.id || index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {customer.name || customer.email}
                    </span>
                  ))}
                  {selectedCustomers.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      +{selectedCustomers.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <Input
                type="text"
                placeholder="Enter email subject..."
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Message *
              </label>
              <textarea
                placeholder="Enter your email message..."
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                disabled={isLoading}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be automatically formatted with your store branding.
              </p>
            </div>

            {/* HTML Content (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom HTML Content (Optional)
              </label>
              <textarea
                placeholder="Enter custom HTML content (leave empty to use default template)..."
                value={emailData.htmlContent}
                onChange={(e) => setEmailData(prev => ({ ...prev, htmlContent: e.target.value }))}
                disabled={isLoading}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, this will override the default email template.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isLoading || !emailData.subject.trim() || !emailData.message.trim()}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send Email</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BroadcastModal;
