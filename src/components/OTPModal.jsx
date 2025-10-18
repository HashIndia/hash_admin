import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

const OTPModal = ({ isOpen, onClose, order, onGenerateOTP, onVerifyOTP }) => {
  const [otp, setOtp] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateOTP = async () => {
    if (!order) return;

    setIsGenerating(true);
    setError('');

    try {
      const generatedOTP = await onGenerateOTP(order.id);
      setOtpGenerated(true);
      // In real app, this would be sent via SMS/email
      alert(`OTP sent to customer: ${generatedOTP}`);
    } catch (err) {
      setError('Failed to generate OTP');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!order || !otp) return;

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await onVerifyOTP(order.id, otp);
      if (isValid) {
        alert('OTP verified successfully! Order marked as delivered.');
        onClose();
        resetModal();
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const resetModal = () => {
    setOtp('');
    setOtpGenerated(false);
    setError('');
    setIsGenerating(false);
    setIsVerifying(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                OTP Delivery Verification
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {order && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Order: {order.id}</p>
                  <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                  <p className="text-sm text-gray-600">Phone: {order.customerPhone}</p>
                  <p className="text-sm text-gray-600">Total: ${order.total.toFixed(2)}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {!otpGenerated ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate an OTP to send to the customer for delivery verification.
                  </p>
                  <Button
                    onClick={handleGenerateOTP}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating OTP...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        Generate & Send OTP
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    OTP has been sent to the customer. Enter the OTP provided by the customer:
                  </p>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isVerifying || otp.length !== 6}
                        className="flex-1"
                      >
                        {isVerifying ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Verifying...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Check className="w-4 h-4 mr-2" />
                            Verify OTP
                          </div>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setOtpGenerated(false)}
                        disabled={isVerifying}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OTPModal;