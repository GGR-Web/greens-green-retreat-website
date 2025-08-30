"use client";

import { useState } from 'react';

export default function KnowledgeBaseAdmin() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setMessage('Knowledge base updated successfully!');
      // Optionally, you can add logic here to refresh the displayed knowledge base
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Centralized AI Knowledge Base</h1>
      <p className="mb-6">Upload documents to add information to the AI's knowledge base.</p>

      <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-white shadow-md">
        <h2 className="text-lg font-semibold mb-4">Add Knowledge From a Document</h2>
        <div className="mb-4">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload a Document (PDF, TXT, CSV)
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            accept=".pdf,.txt,.csv"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !file}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Add to Knowledge Base'}
        </button>
      </form>

      {message && <p className="mt-4 text-center p-3 rounded-lg bg-gray-100">{message}</p>}
    </div>
  );
}
