import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Scan,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Barcode,
  Volume2,
} from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedCode: string) => void;
  title?: string;
  description?: string;
  sampleCodes?: { code: string; label: string }[];
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'สแกน Barcode / QR Code ด้วยกล้อง',
  description = 'ส่องกล้องไปที่รหัส Barcode หรือ QR Code ของสินค้าเพื่อสแกนอัตโนมัติ',
  sampleCodes = [],
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Play audio beep when scanned
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 tone
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      // Audio context might be restricted before interaction
    }
  };

  const startCamera = async () => {
    setCameraState('starting');
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์นี้ไม่รองรับการใช้งานกล้องเว็บแคม (MediaDevices API)');
      }

      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState('active');

      // Start BarcodeDetector loop if supported natively
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
          });

          const detectFrame = async () => {
            if (
              videoRef.current &&
              videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
            ) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  if (rawValue) {
                    handleSuccessfulScan(rawValue);
                    return; // Stop loop after scan
                  }
                }
              } catch (e) {
                // Ignore frame detection errors
              }
            }
            animFrameRef.current = requestAnimationFrame(detectFrame);
          };

          animFrameRef.current = requestAnimationFrame(detectFrame);
        } catch (err) {
          console.warn('BarcodeDetector init failed:', err);
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('โปรดอนุญาตการใช้งานกล้องในเบราว์เซอร์เพื่อเริ่มการสแกน');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('ไม่พบอุปกรณ์กล้องในเครื่องของคุณ');
      } else {
        setErrorMessage(err.message || 'ไม่สามารถเปิดกล้องได้ โปรดตรวจสอบการอนุญาตการใช้กล้อง');
      }
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
  };

  const handleSuccessfulScan = (code: string) => {
    playBeep();
    setLastScanned(code);
    stopCamera();
    onScan(code);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleSuccessfulScan(manualCode.trim());
    setManualCode('');
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setLastScanned(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-slate-800 shadow-2xl space-y-4 my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{title}</h3>
              <p className="text-[11px] text-slate-500">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1 rounded-lg cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport Container */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraState === 'active' ? 'block' : 'hidden'}`}
            autoPlay
            playsInline
            muted
          />

          {/* Scanner Overlay Line and Target Box */}
          {cameraState === 'active' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-emerald-400 border-dashed rounded-2xl relative bg-emerald-500/10 flex items-center justify-center">
                <Scan className="w-12 h-12 text-emerald-400 opacity-60" />
                {/* Laser animation bar */}
                <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Camera Loading State */}
          {cameraState === 'starting' && (
            <div className="text-center text-white space-y-2 p-4">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold">กำลังเชื่อมต่อและเปิดกล้องวิดีโอ...</p>
            </div>
          )}

          {/* Camera Error State */}
          {cameraState === 'error' && (
            <div className="text-center text-white space-y-3 p-6 max-w-xs">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <div>
                <p className="text-xs font-bold text-amber-300 mb-1">ไม่สามารถเปิดใช้งานกล้องได้</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                onClick={startCamera}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ลองเปิดกล้องอีกครั้ง</span>
              </button>
            </div>
          )}
        </div>

        {/* Scan Feedback / Status Notification */}
        {lastScanned && (
          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-medium">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>สแกนสำเร็จ: <strong className="font-mono text-emerald-800">{lastScanned}</strong></span>
            </div>
            <Volume2 className="w-4 h-4 text-emerald-600" />
          </div>
        )}

        {/* Manual Barcode Search Form */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="text-[11px] font-bold text-slate-600 block">
            กรอก Barcode / SKU หรือ QR Code ด้วยตนเอง (หรือใช้สแกนเนอร์ USB):
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="พิมพ์รหัสสินค้า / Barcode..."
                className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
            >
              <Scan className="w-4 h-4" />
              <span>ตกลง</span>
            </button>
          </div>
        </form>

        {/* Quick Click Preset Codes if provided */}
        {sampleCodes.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
              หรือคลิกเลือก Barcode สินค้าตัวอย่างเพื่อทดสอบ:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleCodes.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuccessfulScan(item.code)}
                  className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[11px] px-2.5 py-1 rounded-lg font-mono transition cursor-pointer"
                >
                  {item.label} ({item.code})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
