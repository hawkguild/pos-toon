import React from 'react';
import { useTheme, THEMES, ThemeId } from '../../context/ThemeContext';
import { Palette, Check, RefreshCw, X, Sparkles, Sun, Moon } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { themeId, setThemeId, activeTheme, rollRandomTheme, isDarkMode, toggleDarkMode, setDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl flex flex-col space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div
              className="p-2.5 rounded-2xl text-white shadow-md"
              style={{ backgroundColor: activeTheme.primaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">ธีมและการแสดงผล (Theme & Mode)</h3>
              <p className="text-xs text-slate-500">เลือกโหมดสว่าง/มืด และโทนสีการใช้งานตามสไตล์ร้านค้า</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Dark / Light Mode Switcher Card */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            โหมดการแสดงผลหน้าจอ (Display Mode):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDarkMode(false)}
              className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold text-xs transition cursor-pointer ${
                !isDarkMode
                  ? 'bg-white text-slate-900 border-slate-300 shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-transparent text-slate-500 border-slate-200 hover:bg-white/60'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>โหมดสว่าง (Light Mode)</span>
              {!isDarkMode && <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(true)}
              className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold text-xs transition cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900 text-white border-slate-800 shadow-sm ring-2 ring-amber-400/30'
                  : 'bg-transparent text-slate-500 border-slate-200 hover:bg-white/60'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>โหมดมืด (Dark Mode)</span>
              {isDarkMode && <Check className="w-3.5 h-3.5 text-amber-400 ml-1" />}
            </button>
          </div>
        </div>

        {/* Theme Options Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-700 block">
            โทนสีประจำร้าน (Color Palette - 5 แบบ):
          </span>
        </div>

        {/* Theme Options Grid */}
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const theme = THEMES[id];
            const isSelected = themeId === id;

            return (
              <div
                key={id}
                onClick={() => setThemeId(id)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Swatch Preview Circle */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className="w-8 h-8 rounded-xl border-2 border-white shadow-md flex items-center justify-center overflow-hidden"
                      style={{
                        background:
                          id === 'random'
                            ? activeTheme.swatch[1]
                            : `linear-gradient(135deg, ${theme.swatch[0]} 50%, ${theme.swatch[1]} 50%)`,
                      }}
                    >
                      {id === 'random' && <Sparkles className="w-3.5 h-3.5 text-white animate-spin" />}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-xs">{theme.name}</span>
                      {id === 'emerald' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                          ค่าเริ่มต้น
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {theme.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {id === 'random' && isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        rollRandomTheme();
                      }}
                      className="p-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="สุ่มสีใหม่"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span className="hidden sm:inline">สุ่มใหม่</span>
                    </button>
                  )}

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
          >
            บันทึกและปิด
          </button>
        </div>
      </div>
    </div>
  );
};
