'use client';
import React, { useState, useMemo, ChangeEvent, FormEvent, useCallback, memo } from 'react';

// --- Type Definitions ---
interface TransferData {
  paymentMode: 'UPI' | 'NEFT' | 'RTGS';
  accountNumber: string;
  receiverName: string;
  branch: string;
  amount: number | string;
  narration: string;
}

interface Step {
  id: number;
  name: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

interface TransferDetailsFormProps {
  formData: TransferData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleProceed: (e: FormEvent) => void;
  branchOptions: { value: string, label: string }[];
}

interface SummaryData {
    paymentMode: 'UPI' | 'NEFT' | 'RTGS';
    branchLabel: string;
    formattedAmount: string;
    receiverName: string;
    referenceNumber: string;
    date: string;
    narration: string;
}

interface TransferSummaryCardProps {
  summaryData: SummaryData;
}

interface TransferReviewProps {
    summaryData: SummaryData;
    handleEdit: () => void;
    handleConfirmPayment: () => void;
}


// --- Mock Data/Constants ---
const steps: Step[] = [
  { id: 1, name: 'Details' },
  { id: 2, name: 'Review' },
  { id: 3, name: 'Confirm' },
];

const BRANCH_OPTIONS = [
  { value: '', label: 'Select Branch' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'New Delhi' },
  { value: 'bangalore', label: 'Bangalore' },
];

// ------------------------------------
// --- STANDALONE HELPER COMPONENTS ---
// ------------------------------------

/**
 * Step indicator component for the multi-step form process.
 */
const StepIndicator: React.FC<StepIndicatorProps> = memo(({ currentStep, steps }) => {
  return (
    <nav className="flex items-center justify-start lg:justify-center p-6 bg-white rounded-xl shadow-sm mb-8 max-w-4xl mx-auto" aria-label="Progress">
      <ol className="flex items-center space-x-8 w-full">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          const statusClass = isActive
            ? 'bg-blue-600 text-white'
            : isComplete
            ? 'bg-green-500 text-white'
            : 'bg-gray-100 text-gray-500';

          return (
            <li key={step.id} className="relative flex-1">
              {/* Step circle */}
              <div className={`flex items-center ${step.id !== 1 ? 'lg:pl-8' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition duration-150 ease-in-out ${statusClass}`}>
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'} hidden sm:block`}>
                  {step.name}
                </span>
              </div>
              {/* Divider line (desktop only, hidden on step 3) */}
              {step.id < steps.length && (
                <div className="absolute top-4 left-9 lg:left-[4.5rem] w-[calc(100%-4.5rem)] lg:w-[calc(100%-8rem)] border-t-2 border-dashed border-gray-200 hidden lg:block" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
StepIndicator.displayName = 'StepIndicator';


/**
 * Card component for the Transfer Details form inputs.
 */
const TransferDetailsForm: React.FC<TransferDetailsFormProps> = memo(({ formData, handleChange, handleProceed, branchOptions }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Transfer Details</h2>

      <form onSubmit={handleProceed} className="space-y-5">
        {/* Payment Mode (Radio/Select - Simplified to fixed UPI as per image) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
          <div className="relative">
            <input
              type="text"
              name="paymentMode"
              value={formData.paymentMode}
              readOnly
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm cursor-not-allowed"
            />
            <span className="absolute right-3 top-3.5 text-xs text-blue-600 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M12 4v16"/></svg>
              UPI
            </span>
          </div>
        </div>

        {/* Receiver Account Number */}
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Receiver Account Number</label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., 123456789012"
            maxLength={12}
            required
          />
        </div>

        {/* Receiver Name */}
        <div>
          <label htmlFor="receiverName" className="block text-sm font-medium text-gray-700">Receiver Name</label>
          <input
            type="text"
            id="receiverName"
            name="receiverName"
            value={formData.receiverName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., John Smith"
            required
          />
        </div>

        {/* Branch */}
        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
          <div className="relative">
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none"
              required
            >
              {branchOptions.map(option => (
                <option key={option.value} value={option.value} disabled={option.value === ''}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <div className="relative mt-1 rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 pl-8 pr-4 py-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
              min="1"
              required
            />
          </div>
        </div>

        {/* Narration (Optional) */}
        <div>
          <label htmlFor="narration" className="block text-sm font-medium text-gray-700">Narration (Optional)</label>
          <textarea
            id="narration"
            name="narration"
            rows={3}
            value={formData.narration}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none"
            placeholder="e.g., Monthly utility bill payment."
          />
        </div>

        {/* Proceed Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full inline-flex justify-center items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Proceed to Pay
            <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
});
TransferDetailsForm.displayName = 'TransferDetailsForm';

/**
 * Review component for confirming transfer details before final payment.
 */
const TransferReview: React.FC<TransferReviewProps> = memo(({ summaryData, handleEdit, handleConfirmPayment }) => {
    // Helper function to render a detail row
    const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
        <div className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
        </div>
    );

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Review Transfer</h2>

            <p className="text-gray-600 mb-6">Please carefully review the details below before confirming the payment.</p>

            <div className="space-y-1">
                <DetailRow label="Payment Mode" value={summaryData.paymentMode} />
                <DetailRow label="Account Number" value="9876 **** 1098" /> {/* Masking account number for review */}
                <DetailRow label="Receiver Name" value={summaryData.receiverName} />
                <DetailRow label="Branch" value={summaryData.branchLabel} />
                <DetailRow label="Amount" value={summaryData.formattedAmount} />
                <DetailRow label="Reference Number" value={summaryData.referenceNumber} />
                <DetailRow label="Date" value={summaryData.date} />
            </div>

            <div className="pt-6 border-t border-gray-100 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Narration:</h3>
                <p className="text-gray-600 text-sm italic border p-3 rounded-lg bg-gray-50">
                    {summaryData.narration || 'No narration provided.'}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
                <button
                    onClick={handleConfirmPayment}
                    className="w-full inline-flex justify-center items-center rounded-lg border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                    Confirm Payment
                    <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                <button
                    onClick={handleEdit}
                    type="button"
                    className="w-full inline-flex justify-center items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                    <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.232z" />
                    </svg>
                    Edit Details
                </button>
            </div>
        </div>
    );
});
TransferReview.displayName = 'TransferReview';


/**
 * Card component for the Transfer Summary read-only view.
 */
const TransferSummaryCard: React.FC<TransferSummaryCardProps> = memo(({ summaryData }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full h-full lg:sticky lg:top-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Transfer Summary</h2>

      <div className="space-y-4">
        {/* Row: Payment Mode */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Payment Mode:</span>
          <span className="text-gray-800 font-semibold flex items-center">
            {summaryData.paymentMode}
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {summaryData.paymentMode}
            </span>
          </span>
        </div>

        {/* Row: Amount */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Amount:</span>
          <span className="text-lg font-bold text-gray-900">{summaryData.formattedAmount}</span>
        </div>

        {/* Separator for receiver details */}
        <hr className="border-gray-100" />

        {/* Row: Receiver Name */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Receiver:</span>
          <span className="text-gray-800">{summaryData.receiverName || 'N/A'}</span>
        </div>

        {/* Row: Branch */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Branch:</span>
          <span className="text-gray-800">{summaryData.branchLabel}</span>
        </div>

        {/* Row: Reference Number */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Reference Number:</span>
          <span className="text-gray-800 text-right break-words">{summaryData.referenceNumber}</span>
        </div>

        {/* Row: Date */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Date:</span>
          <span className="text-gray-800">{summaryData.date}</span>
        </div>

        {/* Narration Block */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Narration:</h3>
          <p className="text-gray-600 text-sm italic">{summaryData.narration || 'No narration provided.'}</p>
        </div>
      </div>
    </div>
  );
});
TransferSummaryCard.displayName = 'TransferSummaryCard';


// ------------------------------------
// --- MAIN APPLICATION COMPONENT ---
// ------------------------------------

/**
 * The main application component. Renamed to Page and wrapped in React.memo for App Router compatibility.
 */
function Page() {
  const [currentStep, setCurrentStep] = useState<number>(steps[0].id);
  const [formData, setFormData] = useState<TransferData>({
    paymentMode: 'UPI',
    accountNumber: '987654321098',
    receiverName: 'Jane Doe',
    branch: 'mumbai',
    amount: 5000,
    narration: 'Monthly utility bill payment.',
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? (value ? parseFloat(value) : '') : value,
    }));
  }, []);

  const handleProceed = useCallback((e: FormEvent) => {
    e.preventDefault();
    // In a real app, validation would happen here.
    if (currentStep === 1) { // Only proceed to Review if currently on Details
      setCurrentStep(2);
    }
  }, [currentStep]);

  const handleEdit = useCallback(() => {
    setCurrentStep(1); // Go back to Details
  }, []);

  const handleConfirmPayment = useCallback(() => {
    // In a real app, payment processing would happen here.
    setCurrentStep(3); // Go to Confirm
  }, []);

  // Derived values for the summary card and review page
  const summaryData = useMemo(() => {
    const branchOption = BRANCH_OPTIONS.find(b => b.value === formData.branch);
    return {
      paymentMode: formData.paymentMode,
      branchLabel: branchOption?.label || 'N/A',
      formattedAmount: (typeof formData.amount === 'number' && !isNaN(formData.amount)) ? `₹ ${formData.amount.toLocaleString('en-IN')}` : '₹ 0',
      receiverName: formData.receiverName,
      referenceNumber: 'FINWINT3456789', // Mock data
      date: new Date().toISOString().split('T')[0], // Current Date
      narration: formData.narration,
    };
  }, [formData]);

  const renderMainContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TransferDetailsForm
            formData={formData}
            handleChange={handleChange}
            handleProceed={handleProceed}
            branchOptions={BRANCH_OPTIONS}
          />
        );
      case 2:
        return (
          <TransferReview
            summaryData={summaryData}
            handleEdit={handleEdit}
            handleConfirmPayment={handleConfirmPayment}
          />
        );
      case 3:
        return (
          <div className="bg-white p-10 md:p-16 rounded-xl shadow-lg h-96 flex flex-col items-center justify-center text-center">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-green-700 mb-2">Payment Confirmed!</h2>
            <p className="text-gray-600">Your transaction is complete and the funds have been transferred.</p>
            <p className="text-sm text-gray-500 mt-4">Reference: {summaryData.referenceNumber}</p>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-[Inter] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            FinWinTransfer
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} steps={steps} />

          {/* Form and Summary Container */}
          <div className="flex flex-col lg:flex-row gap-8 mt-10">
            {/* Transaction Content (Left Side - dynamically rendered by step) */}
            <div className="lg:w-3/5">
              {renderMainContent()}
            </div>

            {/* Transfer Summary Card (Right Side) - Hidden on final step */}
            {currentStep !== 3 && (
                <div className="lg:w-2/5 order-first lg:order-last">
                    <TransferSummaryCard summaryData={summaryData} />
                </div>
            )}
            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex space-x-4 mb-2 md:mb-0">
            <a href="#" className="hover:text-blue-600 transition">Quick Links</a>
            <a href="#" className="hover:text-blue-600 transition">Legal</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-600 transition">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 011-1h3V3H7v4H4v3h3z" /></svg>
            </a>
            <a href="#" className="hover:text-blue-600 transition">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-17.7 11.3 2.3.1 4.4-.6 6.3-2.6C5.8 17 3 14.2 3 11v-.1c.7.4 1.5.6 2.4.6C3.9 14.8 5.6 16.4 8 16.5c-3.1 2-6.9 1.7-9.9 1.5.3 1.7 1 3.4 2 4.9.4.5.9.9 1.4 1.3 5.8 4 13.9 2 17.5-3.8.3-.5.5-1 .7-1.5.2-.6.3-1.3.3-2V4z"/></svg>
            </a>
            <a href="#" className="hover:text-blue-600 transition">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zm-7 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm6-11c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z"/></svg>
            </a>
            <a href="#" className="hover:text-blue-600 transition">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 4.5l-2.9 2.4-2.4-2.4L2 12.8 10.2 21 20.5 10.7 17 7.2 20.5 4.5zM12 18.5L4.8 11.3 12 4.1 19.2 11.3 12 18.5z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrapping the Page component in memo before exporting it as default.
export default memo(Page);
