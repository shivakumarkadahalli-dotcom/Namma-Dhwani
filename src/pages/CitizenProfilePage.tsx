import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { User, Camera, Upload, Trash2, Save, AlertCircle, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';

export const CitizenProfilePage: React.FC = () => {
  const { currentUser, language, setLanguage, updateProfile, showToast } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Ananya Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'ananya.sharma@example.com');
  const [ward, setWard] = useState(currentUser?.ward || 'Ward 18 - Indiranagar');
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'en');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser?.avatarUrl || '');

  const [errors, setErrors] = useState<{ name?: string; email?: string; ward?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setWard(currentUser.ward || '');
      setSelectedLang(currentUser.language || language || 'en');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser, language]);

  const getInitials = (n: string) => {
    if (!n || !n.trim()) return 'AS';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Profile photo must be less than 5 MB.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File Type', 'Please select an image file (JPG, PNG, or WEBP).', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        updateProfile({ avatarUrl: result });
        showToast('Photo Updated', 'Profile photo updated successfully.', 'success');
      }
    };
    reader.onerror = () => {
      showToast('Upload Error', 'Failed to read image file. Please try again.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    updateProfile({ avatarUrl: '' });
    showToast('Photo Removed', 'Profile photo removed. Default initials avatar will be displayed.', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedWard = ward.trim();

      const newErrors: { name?: string; email?: string; ward?: string } = {};

      if (!trimmedName) {
        newErrors.name = 'Full name is required.';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail) {
        newErrors.email = 'Email address is required.';
      } else if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid email address.';
      }

      if (!trimmedWard) {
        newErrors.ward = 'Municipal ward zone is required.';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const firstErr = newErrors.name || newErrors.email || newErrors.ward;
        showToast('Validation Error', firstErr, 'error');
        return;
      }

      setErrors({});

      setLanguage(selectedLang);
      updateProfile({
        name: trimmedName,
        email: trimmedEmail,
        ward: trimmedWard,
        language: selectedLang,
        avatarUrl: avatarUrl || '',
      });

      showToast('Profile Updated', 'Your profile information has been saved successfully.', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Unable to Save', 'Unable to save your changes. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans">Citizen Profile & Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal contact details, profile photo, and system preferences.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          
          {/* PROFILE PHOTO SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                Profile Photo
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
              {/* Avatar Preview */}
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white text-2xl font-black flex items-center justify-center shadow-xs border-2 border-blue-700">
                    {getInitials(name)}
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  JPG, PNG or WEBP • Max 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION SECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans flex items-center gap-1.5 border-b pb-2">
              <User className="w-4 h-4 text-blue-600" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Enter your full name"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:ring-2 focus:outline-hidden ${
                    errors.name ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:ring-2 focus:outline-hidden ${
                    errors.email ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Municipal Ward Zone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={ward}
                onChange={(e) => {
                  setWard(e.target.value);
                  if (errors.ward) setErrors((prev) => ({ ...prev, ward: undefined }));
                }}
                placeholder="e.g. Ward 18 - Indiranagar"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:ring-2 focus:outline-hidden ${
                  errors.ward ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
              {errors.ward && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.ward}</span>
                </p>
              )}
            </div>
          </div>

          {/* LANGUAGE & ACCESSIBILITY SECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans flex items-center gap-1.5 border-b pb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Language & Accessibility
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                System Language
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as Language)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-4 flex items-center justify-end border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
