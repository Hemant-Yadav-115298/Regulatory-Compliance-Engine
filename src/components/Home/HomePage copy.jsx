import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Repeat,
  Banknote,
  PlayCircle,
  Maximize2,
  X,
} from 'lucide-react';
import { TEST_OPTIONS } from '../../constants/testOptions';
import { useComplianceTest } from '../../hooks/useComplianceTest';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const normalizeUrl = (raw) => {
  let url = raw.trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
};

const HomePage = () => {
  const [gameUrl, setGameUrl] = useState('');
  const [testType, setTestType] = useState('Select a test type');
  const [urlError, setUrlError] = useState('');
  const [selectedSubTests, setSelectedSubTests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const { isLoading, error, result, runTest, clearError } = useComplianceTest();

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to render icons
  const getIcon = (iconName, iconColor) => {
    const iconProps = { className: `w-5 h-5 ${iconColor}` };
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck {...iconProps} />;
      case 'RotateCcw':
        return <RotateCcw {...iconProps} />;
      case 'Repeat':
        return <Repeat {...iconProps} />;
      case 'Banknote':
        return <Banknote {...iconProps} />;
      case 'PlayCircle':
        return <PlayCircle {...iconProps} />;
      case 'Maximize2':
        return <Maximize2 {...iconProps} />;
      default:
        return null;
    }
  };

  const closeSubTestModal = () => setIsOpen(false);
  const openSubTestModal = () => setIsOpen(true);

  // Handle URL change
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    setGameUrl(url);
    setUrlError(''); // Clear any previous URL errors
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  // Handler to open the game URL in a new tab
  const handleOpenUrl = useCallback(() => {
    const urlToOpen = normalizeUrl(gameUrl);
    if (urlToOpen) {
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
      showToast('info', 'URL opened in new tab');
    } else {
      showToast('error', 'Please enter a URL first');
    }
  }, [gameUrl, showToast]);

  // Handler to open the modal when a test type is selected
  const handleTestTypeChange = (e) => {
    const newTestType = e.target.value;
    setTestType(newTestType);
    setSelectedSubTests([]); // Reset sub-tests when the main test type changes
    openSubTestModal(); // Open the modal
  };

  // Toggle selection of a sub-test
  const handleSubTestToggle = useCallback(
    (sub) => {
      setSelectedSubTests((prev) =>
        prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
      );
    },
    [setSelectedSubTests]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearError();

    if (!gameUrl.trim()) {
      setUrlError('URL is required.');
      showToast('error', 'Please enter a valid URL.');
      return;
    }

    const urlToOpen = normalizeUrl(gameUrl);

    try {
      if (urlToOpen) {
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');
      }

      const response = await runTest(gameUrl, testType, selectedSubTests);
      showToast('success', `Test submitted successfully! Test ID: ${response.test_id}`);
      console.log(selectedSubTests);
    } catch (err) {
      showToast('error', err?.message || 'Failed to submit test');
      return; // if runTest failed, skip flow
    }

    // Run compliance flow separately; failure here shouldn't undo previous success
    try {
      if (window?.electronAPI?.runComplianceFlow) {
        await window.electronAPI.runComplianceFlow({ url: gameUrl });
        showToast('success', 'Compliance flow completed!');
      } else {
        // Optional: warn if electronAPI not available
        showToast('info', 'Compliance flow not executed (electronAPI unavailable).');
      }
    } catch (err) {
      showToast('error', `Compliance flow error: ${err?.message || 'unknown error'}`);
    }
  };

  // Get all sub-test types for the current test type
  const allSubTestOptions =
    TEST_OPTIONS.find((opt) => opt.label === testType)?.test_types || [];

  return (
    <div className="fixed inset-0 overflow-hidden w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
          Automated Compliance Test.
        </h1>
        <p className="text-lg md:text-xl text-gray-300">
          A smart platform for automated regulatory compliance testing.
        </p>
      </section>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        {/* Game URL */}
        <div className="mb-4">
          <label htmlFor="gameUrl" className="block mb-1 text-sm font-medium text-blue-300">
            Game URL *
          </label>
          <input
            id="gameUrl"
            type="url"
            placeholder="Enter game URL (e.g., https://example.com)"
            className={`w-full px-4 py-2 rounded-lg bg-gray-700 text-white border ${urlError ? 'border-red-500' : 'border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={gameUrl}
            onChange={handleUrlChange}
            required
            disabled={isLoading}
          />
          {urlError && <p className="mt-1 text-sm text-red-400">{urlError}</p>}
        </div>

        {/* Test Type Dropdown */}
        <div className="mb-4">
          <label htmlFor="testType" className="block mb-1 text-sm font-medium text-blue-300">
            Select Test Type *
          </label>
          <select
            id="testType"
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={testType}
            onChange={handleTestTypeChange}
            disabled={isLoading}
          >
            <option value="Select a test type" disabled>
              -- Select a test type --
            </option>
            {TEST_OPTIONS.map((opt, idx) => (
              <option key={idx} value={opt.label} title={opt.description}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Sub-tests Display */}
        {selectedSubTests.length > 0 && (
          <div className="mb-4">
            <h3 className="block mb-1 text-sm font-medium text-blue-300">
              Selected Sub-tests:
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSubTests.map((sub, idx) => (
                <span
                  key={idx}
                  className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow border border-blue-400"
                >
                  {getIcon('ShieldCheck', 'mr-1')}
                  {sub}
                  <button
                    type="button"
                    className="ml-2 text-white hover:text-red-300 focus:outline-none"
                    onClick={() => handleSubTestToggle(sub)}
                    aria-label={`Remove ${sub}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error and Success Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-600 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-4 p-3 bg-green-900 border border-green-600 rounded-lg">
            <p className="text-sm text-green-200">{result.message}</p>
            {result.test_id && (
              <p className="text-xs text-green-300 mt-1">Test ID: {result.test_id}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-4 space-y-3">
          <button
            type="button"
            onClick={handleOpenUrl}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-semibold shadow-md transition-all duration-300"
            disabled={!gameUrl.trim() || isLoading}
          >
            🔗 Open URL in New Tab
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-semibold shadow-md transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner text="Running Test..." /> : '🚀 Run Compliance Test'}
          </button>
        </div>
      </form>

      {/* Sub-test Selection Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeSubTestModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-green-400 flex justify-between items-center"
                  >
                    Select Sub-tests for "{testType}"
                    <button
                      type="button"
                      onClick={closeSubTestModal}
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-4">
                      Choose which specific tests you want to run within the "{testType}" category.
                    </p>
                    <div className="max-h-80 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allSubTestOptions.length > 0 ? (
                        allSubTestOptions.map((sub, idx) => {
                          const isSelected = selectedSubTests.includes(sub);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSubTestToggle(sub)}
                              className={`w-full text-left p-4 rounded-xl shadow-lg transition-all duration-200 border-2 flex items-center gap-2
                                ${isSelected
                                  ? 'bg-blue-600 border-blue-400 ring-2 ring-blue-500'
                                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              disabled={isLoading}
                            >
                              {getIcon(
                                'ShieldCheck',
                                isSelected ? 'text-white' : 'text-green-400'
                              )}
                              <span className="break-words whitespace-normal text-sm font-semibold text-white">
                                {sub}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-gray-400 text-center py-4 col-span-2">
                          No sub-test types available for this selection.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={closeSubTestModal}
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Toast Notifications */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default HomePage;
