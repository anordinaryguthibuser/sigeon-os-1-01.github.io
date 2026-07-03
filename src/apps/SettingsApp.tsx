import React, { useState } from 'react';

interface SettingsProps {
  pcName: string;
  setPcName: (name: string) => void;
}

export default function SettingsApp({ pcName, setPcName }: SettingsProps) {
  const [tempName, setTempName] = useState(pcName);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setPcName(tempName.trim());
      alert("Settings saved successfully.");
    } else {
      alert("PC Name cannot be empty.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black p-4 font-sans select-none overflow-auto">
      {/* Settings Panel Header */}
      <div className="border-b-4 border-black pb-2 mb-4">
        <h2 className="text-xl font-bold tracking-tight">SIGEON OS SETTINGS</h2>
        <p className="text-sm text-gray-500 mt-1">Sigeon OS Control Panel v1.01</p>
      </div>

      <form onSubmit={handleApply} className="flex flex-col gap-6 max-w-sm">
        {/* Computer Rename Section */}
        <div className="border-[3px] border-black p-3 bg-gray-50">
          <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Computer Name</label>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            maxLength={15}
            className="w-full border-2 border-black bg-white text-black px-2 py-1 outline-none font-mono focus:bg-gray-100"
          />
          <p className="text-xs text-gray-600 mt-2">Maximum 15 characters.</p>
        </div>

        {/* System Version info Section */}
        <div className="border-[3px] border-black p-3 bg-gray-50">
          <label className="block text-sm font-bold mb-1 uppercase tracking-wide">System Information</label>
          <div className="text-sm flex flex-col gap-1 font-mono mt-2">
            <div><span className="font-sans font-bold">OS:</span> Sigeon OS 1.01</div>
            <div><span className="font-sans font-bold">Build:</span> MS-PEX-101</div>
            <div><span className="font-sans font-bold">Storage:</span> LOCAL_FS (30 files max)</div>
            <div><span className="font-sans font-bold">Memory:</span> 640KB RAM (Allocated)</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="self-start border-[3px] border-black bg-gray-200 text-black px-4 py-1.5 font-bold hover:bg-black hover:text-white active:bg-gray-400"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
