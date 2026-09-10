import React, { useState, useEffect } from 'react';
import { Product, BusinessCategory } from '../../types';
import { usePOS } from '../../context/POSContext';
import { getBusinessStyle } from '../../utils/businessColorUtils';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Plus,
  Sparkles,
  Utensils,
  Coffee,
  Leaf,
  Package,
  Trash2,
} from 'lucide-react';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

// Preset images for easy selection
const PRESET_IMAGES = [
  {
    name: 'ผัดไทย / อาหารผัด',
    category: 'food',
    url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ก๋วยเตี๋ยว / ต้มยำ',
    category: 'food',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ข้าวผัด / ข้าวหน้า',
    category: 'food',
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ส้มตำ / ยำ spicy',
    category: 'food',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'กาแฟเย็น / ชาเย็น',
    category: 'food',
    url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'น้ำกระท่อมบรรจุขวด',
    category: 'kratom',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ชาสมุนไพร / กระท่อมสด',
    category: 'kratom',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'บุหรี่ / ผลิตภัณฑ์ยาสูบ',
    category: 'cigarette',
    url: 'https://images.unsplash.com/photo-1527016021513-b09758b777bd?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ไซรัป / น้ำหวานแต่งกลิ่นเข้มข้น',
    category: 'syrup',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'กัญชา ช่อดอกเกรดพรีเมียม',
    category: 'cannabis',
    url: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'กัญชา โรลสำเร็จรูป (Pre-roll)',
    category: 'cannabis',
    url: 'https://images.unsplash.com/photo-1568658176307-bfbd2873abda?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'สินค้าทั่วไป / อุปกรณ์',
    category: 'general',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
  },
];

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, businesses, units } = usePOS();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<string>('food');
  const [subcategory, setSubcategory] = useState('อาหารจานเดียว');
  const [price, setPrice] = useState<number>(80);
  const [cost, setCost] = useState<number>(35);
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [stockUnit, setStockUnit] = useState<string>('dish');
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'available' | 'out_of_stock' | 'disabled'>('available');

  // Category specific
  const [kitchenStation, setKitchenStation] = useState<'kitchen' | 'bar' | 'prep'>('kitchen');
  const [strain, setStrain] = useState('');
  const [thcPercent, setThcPercent] = useState<number>(18);
  const [cbdPercent, setCbdPercent] = useState<number>(1);
  const [volumeMl, setVolumeMl] = useState<number>(500);

  // Tab for image input
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'presets'>('upload');

  // Load editing product or default
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCode(productToEdit.code);
      setCategory(productToEdit.category);
      setSubcategory(productToEdit.subcategory || '');
      setPrice(productToEdit.price);
      setCost(productToEdit.cost);
      setStockQuantity(productToEdit.stockQuantity);
      setStockUnit(productToEdit.stockUnit);
      setMinStockAlert(productToEdit.minStockAlert);
      setImage(productToEdit.image || '');
      setDescription(productToEdit.description || '');
      setStatus(productToEdit.status);

      if (productToEdit.foodDetails) {
        setKitchenStation(productToEdit.foodDetails.kitchenStation || 'kitchen');
      }
      if (productToEdit.cannabisDetails) {
        setStrain(productToEdit.cannabisDetails.strain || '');
        setThcPercent(productToEdit.cannabisDetails.thcPercent || 0);
        setCbdPercent(productToEdit.cannabisDetails.cbdPercent || 0);
      }
      if (productToEdit.kratomDetails) {
        setVolumeMl(productToEdit.kratomDetails.volumeMl || 500);
      }
    } else {
      // Reset form
      const genCode = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
      const defaultCategory = businesses.find((b) => b.enabled)?.id || 'food';
      const defaultUnit = units.find((u) => u.enabled)?.id || 'pcs';

      setName('');
      setCode(genCode);
      setCategory(defaultCategory);
      setSubcategory('ทั่วไป');
      setPrice(80);
      setCost(35);
      setStockQuantity(50);
      setStockUnit(defaultUnit);
      setMinStockAlert(5);
      setImage('');
      setDescription('');
      setStatus('available');
      setKitchenStation('kitchen');
      setStrain('');
      setThcPercent(18);
      setCbdPercent(1);
      setVolumeMl(500);
    }
  }, [productToEdit, isOpen, businesses, units]);

  // When category changes, adjust default stockUnit and subcategory
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (!productToEdit) {
      if (cat === 'food') {
        setStockUnit('dish');
        setSubcategory('อาหารจานเดียว');
        setCode('FOOD-' + Math.floor(1000 + Math.random() * 9000));
      } else if (cat === 'kratom') {
        setStockUnit('bottle');
        setSubcategory('เครื่องดื่มสมุนไพร');
        setCode('KT-' + Math.floor(1000 + Math.random() * 9000));
      } else if (cat === 'cannabis') {
        setStockUnit('g');
        setSubcategory('ช่อดอก (Flower)');
        setCode('CAN-' + Math.floor(1000 + Math.random() * 9000));
      } else if (cat === 'cigarette') {
        setStockUnit('pcs');
        setSubcategory('บุหรี่ซอง / ยาสูบ');
        setCode('CIG-' + Math.floor(1000 + Math.random() * 9000));
      } else if (cat === 'syrup') {
        setStockUnit('bottle');
        setSubcategory('ไซรัปแต่งกลิ่น / น้ำหวาน');
        setCode('SYR-' + Math.floor(1000 + Math.random() * 9000));
      } else if (cat === 'spa') {
        setStockUnit('hour');
        setSubcategory('บริการนวด & สปา');
        setCode('SPA-' + Math.floor(1000 + Math.random() * 9000));
      } else if (cat === 'cafe') {
        setStockUnit('cup');
        setSubcategory('กาแฟ & เบเกอรี่');
        setCode('CAF-' + Math.floor(1000 + Math.random() * 9000));
      } else {
        setStockUnit('pcs');
        setSubcategory('สินค้าทั่วไป');
        setCode('SKU-' + Math.floor(1000 + Math.random() * 9000));
      }
    }
  };

  // Handle File Upload to Base64 Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพเกิน 5MB กรุณาเลือกรูปภาพที่มีขนาดเล็กลง');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณากรอกชื่อเมนู/สินค้า');
      return;
    }

    const productPayload: Omit<Product, 'id'> = {
      name: name.trim(),
      code: code.trim() || 'SKU-' + Date.now(),
      category: category as BusinessCategory,
      subcategory: subcategory.trim(),
      price: Number(price) || 0,
      cost: Number(cost) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      stockUnit,
      minStockAlert: Number(minStockAlert) || 1,
      image: image.trim() || undefined,
      description: description.trim() || undefined,
      status,
      ...(category === 'food' && {
        foodDetails: {
          kitchenStation,
          allowCustomNotes: true,
        },
      }),
      ...(category === 'cannabis' && {
        cannabisDetails: {
          strain: strain.trim() || name.trim(),
          thcPercent: Number(thcPercent) || 0,
          cbdPercent: Number(cbdPercent) || 0,
          controlledHerbLicenseRequired: true,
        },
      }),
      ...(category === 'kratom' && {
        kratomDetails: {
          volumeMl: Number(volumeMl) || 500,
          fdaWarningLabel: 'ห้ามจำหน่ายแก่สตรีมีครรภ์และผู้มีอายุต่ำกว่า 18 ปี',
        },
      }),
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productPayload);
      alert('แก้ไขข้อมูลเมนู/สินค้าเรียบร้อยแล้ว');
    } else {
      addProduct(productPayload);
      alert('เพิ่มเมนู/สินค้าใหม่เข้าสู่ระบบเรียบร้อยแล้ว');
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col text-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                {productToEdit ? 'แก้ไขเมนู / สินค้า' : 'เพิ่มเมนู / สินค้าใหม่'}
              </h3>
              <p className="text-xs text-slate-500">
                ระบุรายละเอียด ราคา สต็อก และรูปภาพเมนูสำหรับแสดงในระบบ POS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">
                1. เลือกหมวดหมู่ธุรกิจ (Business Category) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                (จัดการหมวดหมู่ได้ที่เมนู "ตั้งค่าร้านค้า")
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {businesses
                .filter((b) => b.enabled)
                .map((b) => {
                  const isSelected = category === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleCategoryChange(b.id)}
                      className={`p-3 rounded-2xl border flex items-center space-x-2 transition cursor-pointer ${getBusinessStyle(
                        b.color,
                        isSelected
                      )}`}
                    >
                      <span className="text-lg shrink-0">{b.icon || '📦'}</span>
                      <span className="text-xs truncate font-bold">{b.shortName || b.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ชื่อเมนู / สินค้า <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ผัดไทยกุ้งสด, ชาเขียวเย็น, ช่อดอกกัญชา"
                className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                รหัสสินค้า / SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น SKU-101"
                className="w-full bg-white text-slate-800 text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">หมวดหมู่ย่อย (Subcategory)</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="เช่น อาหารจานเดียว, เครื่องดื่ม, ช่อดอก"
                className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">สถานะสินค้า</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="available">พร้อมขาย (Available)</option>
                <option value="out_of_stock">สินค้าหมด (Out of stock)</option>
                <option value="disabled">ระงับการขาย (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ราคาขาย (บาท)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white text-emerald-700 font-extrabold font-mono text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ต้นทุน (บาท)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-white text-slate-800 font-mono text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">สต็อกเริ่มต้น</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-white text-slate-900 font-mono text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">หน่วยนับ (UOM)</label>
              <select
                value={stockUnit}
                onChange={(e) => setStockUnit(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-bold"
              >
                {units
                  .filter((u) => u.enabled)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                {!units.some((u) => u.id === stockUnit) && (
                  <option value={stockUnit}>{stockUnit}</option>
                )}
              </select>
            </div>
          </div>

          {/* Category Specific Options */}
          {category === 'food' && (
            <div className="bg-orange-50/60 p-3 rounded-2xl border border-orange-200">
              <label className="block font-bold text-orange-900 mb-1">สถานีครัวสั่งอาหาร (Kitchen Station)</label>
              <div className="flex space-x-3 text-xs">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="station"
                    value="kitchen"
                    checked={kitchenStation === 'kitchen'}
                    onChange={() => setKitchenStation('kitchen')}
                    className="text-orange-600"
                  />
                  <span>ครัวหลัก (Kitchen)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="station"
                    value="bar"
                    checked={kitchenStation === 'bar'}
                    onChange={() => setKitchenStation('bar')}
                    className="text-orange-600"
                  />
                  <span>บาร์น้ำ/เครื่องดื่ม (Bar)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="station"
                    value="prep"
                    checked={kitchenStation === 'prep'}
                    onChange={() => setKitchenStation('prep')}
                    className="text-orange-600"
                  />
                  <span>ครัวเตรียม/ของหวาน (Prep)</span>
                </label>
              </div>
            </div>
          )}

          {category === 'cannabis' && (
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-3">
              <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>ข้อมูลกัญชาควบคุม (Cannabis Attributes)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">สายพันธุ์ (Strain Name)</label>
                  <input
                    type="text"
                    value={strain}
                    onChange={(e) => setStrain(e.target.value)}
                    placeholder="เช่น OG Kush, Amnesia Haze"
                    className="w-full bg-white text-slate-800 text-xs p-2 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">สารสำคัญ THC %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={thcPercent}
                    onChange={(e) => setThcPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 text-xs p-2 rounded-xl border border-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">สารสำคัญ CBD %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={cbdPercent}
                    onChange={(e) => setCbdPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white text-slate-800 text-xs p-2 rounded-xl border border-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'kratom' && (
            <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 space-y-3">
              <div className="font-bold text-blue-900 flex items-center space-x-1.5">
                <Coffee className="w-4 h-4 text-blue-600" />
                <span>ข้อมูลผลิตภัณฑ์กระท่อม (Kratom Attributes)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-blue-800 mb-1">ปริมาตรขวด/แก้ว (มิลลิลิตร ml)</label>
                  <input
                    type="number"
                    min="0"
                    value={volumeMl}
                    onChange={(e) => setVolumeMl(parseFloat(e.target.value) || 0)}
                    placeholder="เช่น 500 หรือ 1000"
                    className="w-full bg-white text-slate-800 text-xs p-2 rounded-xl border border-blue-300 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-800 mb-1">คำเตือน สธ.</label>
                  <div className="p-2 bg-white rounded-xl border border-blue-200 text-blue-900 font-medium text-[11px]">
                    ห้ามจำหน่ายแก่สตรีมีครรภ์และผู้มีอายุต่ำกว่า 18 ปี
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">คำอธิบายรายละเอียดสินค้า / ส่วนผสม</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุส่วนผสมพิเศษ หรือข้อแนะนำการบริโภค..."
              className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Product Image Input */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>รูปภาพสินค้า (Product Image)</span>
              </label>

              {/* Tabs */}
              <div className="flex space-x-1 bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${
                    imageTab === 'upload' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  อัปโหลดไฟล์
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('presets')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${
                    imageTab === 'presets' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  เลือกรูปสำเร็จ
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${
                    imageTab === 'url' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  URL รูปภาพ
                </button>
              </div>
            </div>

            {/* Tab 1: Upload from device */}
            {imageTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white p-4 rounded-2xl text-center cursor-pointer transition relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                <p className="font-bold text-slate-700">คลิกหรือลากวางไฟล์รูปภาพที่นี่</p>
                <p className="text-[10px] text-slate-400 mt-0.5">รองรับ JPG, PNG, WEBP (ไม่เกิน 5MB)</p>
              </div>
            )}

            {/* Tab 2: Presets Grid */}
            {imageTab === 'presets' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                {PRESET_IMAGES.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setImage(preset.url)}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer group transition ${
                      image === preset.url
                        ? 'border-indigo-600 ring-2 ring-indigo-400/40'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-14 object-cover group-hover:scale-105 transition"
                    />
                    <div className="p-1 text-[9px] truncate bg-white text-slate-700 font-medium">
                      {preset.name}
                    </div>
                    {image === preset.url && (
                      <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: URL */}
            {imageTab === 'url' && (
              <div>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            )}

            {/* Image Preview */}
            {image && (
              <div className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-slate-200">
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                />
                <div className="flex-1 truncate">
                  <p className="text-[11px] font-bold text-slate-700">รูปภาพที่เลือก</p>
                  <p className="text-[10px] text-slate-400 truncate">{image}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="ลบรูปภาพ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้าลงระบบ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
