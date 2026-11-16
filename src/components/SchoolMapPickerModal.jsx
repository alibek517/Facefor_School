import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  X, 
  Check, 
  Navigation, 
  Compass, 
  Sliders, 
  ShieldCheck, 
  Info,
  Building2,
  RotateCcw,
  Pencil,
  MoveHorizontal,
  Maximize2
} from 'lucide-react';
import { SCHOOL_DEFAULT_COORDS } from '../utils/teacherLocationService';

// Markazdan berilgan radius (metr) bo'yicha sharqiy chekka nuqta koordinatasini hisoblash
function getHandleLatLng(centerLat, centerLng, radius) {
  const metersPerDegreeLon = 111320 * Math.cos((centerLat * Math.PI) / 180);
  const dLng = radius / metersPerDegreeLon;
  return [centerLat, centerLng + dLng];
}

export const SchoolMapPickerModal = ({
  isOpen,
  onClose,
  school,
  onSave
}) => {
  const defaultLat = Number(school?.lat) || SCHOOL_DEFAULT_COORDS.lat || 41.5515;
  const defaultLng = Number(school?.lng) || SCHOOL_DEFAULT_COORDS.lng || 60.6315;
  const defaultRadius = Number(school?.radiusMeters || school?.radius) || SCHOOL_DEFAULT_COORDS.radiusMeters || 180;

  const [lat, setLat] = useState(defaultLat);
  const [lng, setLng] = useState(defaultLng);
  const [radiusMeters, setRadiusMeters] = useState(defaultRadius);
  const [isLocating, setIsLocating] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawMessage, setDrawMessage] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const handleMarkerRef = useRef(null);
  const drawGuideLineRef = useRef(null);

  // Modal ochilganda qiymatlarni qayta yuklash
  useEffect(() => {
    if (isOpen) {
      const initLat = Number(school?.lat) || SCHOOL_DEFAULT_COORDS.lat || 41.5515;
      const initLng = Number(school?.lng) || SCHOOL_DEFAULT_COORDS.lng || 60.6315;
      const initRadius = Number(school?.radiusMeters || school?.radius) || SCHOOL_DEFAULT_COORDS.radiusMeters || 180;
      setLat(initLat);
      setLng(initLng);
      setRadiusMeters(initRadius);
      setIsDrawingMode(false);
      setDrawMessage('');
    }
  }, [isOpen, school]);

  // Leaflet xaritasini initsializatsiya qilish
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // 1. Yashil hudud doirasi (radius)
      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.18,
        weight: 2.5,
        dashArray: '6, 6'
      }).addTo(map);
      circleRef.current = circle;

      // 2. Maktab binosi markazi markeri (drag qilinadigan)
      const schoolIcon = L.divIcon({
        className: 'custom-school-picker-pin',
        html: `
          <div style="position:relative; width:44px; height:44px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <div style="background:#2563eb; color:#ffffff; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(37,99,235,0.45); border:3px solid #ffffff; font-size:20px; cursor:grab;">
              🏫
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:7px solid #2563eb; margin-top:-1px;"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44]
      });

      const marker = L.marker([lat, lng], {
        icon: schoolIcon,
        draggable: true
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:sans-serif; text-align:center; padding:2px;">
          <b>${school?.name || 'Maktab binosi'}</b><br/>
          <span style="font-size:11px; color:#64748b;">Markerni surib aniq binoga qo'ying</span>
        </div>
      `);
      markerRef.current = marker;

      // 3. Radiusni qo'l bilan cho'zish uchun aylanadagi interaktiv tutqich (Radius Handle)
      const handleIcon = L.divIcon({
        className: 'custom-radius-handle-pin',
        html: `
          <div style="background:#10b981; color:#ffffff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(16,185,129,0.5); border:2.5px solid #ffffff; cursor:ew-resize; font-size:13px; font-weight:bold;">
            ↔
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const handlePos = getHandleLatLng(lat, lng, radiusMeters);
      const handleMarker = L.marker(handlePos, {
        icon: handleIcon,
        draggable: true,
        zIndexOffset: 1000
      }).addTo(map);

      handleMarker.bindTooltip(`Radius: ${radiusMeters}m (Qo'l bilan surib o'zgartiring)`, {
        permanent: false,
        direction: 'top'
      });
      handleMarkerRef.current = handleMarker;

      // Maktab markazi surilganda (drag)
      marker.on('drag', (e) => {
        const cur = e.target.getLatLng();
        circle.setLatLng(cur);
        const curR = circle.getRadius();
        handleMarker.setLatLng(getHandleLatLng(cur.lat, cur.lng, curR));
      });

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        const newLat = +newPos.lat.toFixed(6);
        const newLng = +newPos.lng.toFixed(6);
        setLat(newLat);
        setLng(newLng);
        circle.setLatLng([newLat, newLng]);
        const curR = circle.getRadius();
        handleMarker.setLatLng(getHandleLatLng(newLat, newLng, curR));
      });

      // Tutqich orqali radiusni qo'l bilan cho'zish / qisqartirish (interactive drag)
      handleMarker.on('drag', (e) => {
        const centerPos = marker.getLatLng();
        const curHandlePos = e.target.getLatLng();
        const dist = Math.round(centerPos.distanceTo(curHandlePos));
        const clamped = Math.max(30, Math.min(1000, dist));
        setRadiusMeters(clamped);
        circle.setRadius(clamped);
        handleMarker.setTooltipContent(`Radius: ${clamped} metr`);
        handleMarker.openTooltip();
      });

      handleMarker.on('dragend', (e) => {
        const centerPos = marker.getLatLng();
        const curHandlePos = e.target.getLatLng();
        const dist = Math.round(centerPos.distanceTo(curHandlePos));
        const clamped = Math.max(30, Math.min(1000, dist));
        setRadiusMeters(clamped);
        circle.setRadius(clamped);
        // Aniq gorizontal chiziqqa tekislash
        handleMarker.setLatLng(getHandleLatLng(centerPos.lat, centerPos.lng, clamped));
      });

      // Xarita ustiga bosilganda (click)
      map.on('click', (e) => {
        const clickPos = e.latlng;
        const currentCenter = marker.getLatLng();

        // Agar "Qo'l bilan radius chizish" rejimi faol bo'lsa:
        // Bosilgan nuqtagacha bo'lgan masofa to'g'ridan-to'g'ri maktab radiusi bo'ladi!
        if (mapContainerRef.current?.getAttribute('data-drawing-mode') === 'true') {
          const dist = Math.round(currentCenter.distanceTo(clickPos));
          const newRadius = Math.max(30, Math.min(1000, dist));
          setRadiusMeters(newRadius);
          circle.setRadius(newRadius);
          handleMarker.setLatLng(getHandleLatLng(currentCenter.lat, currentCenter.lng, newRadius));
          setDrawMessage(`✅ Maktab radiusi qo'l bilan belgilandi: ${newRadius} metr!`);
          setTimeout(() => setDrawMessage(''), 4000);
          return;
        }

        // Oddiy rejim: maktab markazini yangi joyga ko'chirish
        const clickLat = +clickPos.lat.toFixed(6);
        const clickLng = +clickPos.lng.toFixed(6);
        setLat(clickLat);
        setLng(clickLng);
        marker.setLatLng([clickLat, clickLng]);
        circle.setLatLng([clickLat, clickLng]);
        const curR = circle.getRadius();
        handleMarker.setLatLng(getHandleLatLng(clickLat, clickLng, curR));
      });

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Radius o'zgarganda xaritani yangilash
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters);
    }
    if (markerRef.current && handleMarkerRef.current) {
      const c = markerRef.current.getLatLng();
      handleMarkerRef.current.setLatLng(getHandleLatLng(c.lat, c.lng, radiusMeters));
    }
  }, [radiusMeters]);

  // Qo'l bilan chizish rejimi o'zgarganda DOM atributini yangilash
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.setAttribute('data-drawing-mode', isDrawingMode ? 'true' : 'false');
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = isDrawingMode ? 'crosshair' : 'default';
      }
    }
  }, [isDrawingMode]);

  // Koordinatalar qo'lda o'zgarganda marker, doira va tutqichni yangilash
  const handleCoordManualChange = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([newLat, newLng]);
    }
    if (handleMarkerRef.current) {
      handleMarkerRef.current.setLatLng(getHandleLatLng(newLat, newLng, radiusMeters));
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([newLat, newLng]);
    }
  };

  // Brauzer GPS orqali hozirgi turgan joyni aniqlash
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Brauzeringiz GPS xizmatini qo\'llab-quvvatlamaydi.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const curLat = +pos.coords.latitude.toFixed(6);
        const curLng = +pos.coords.longitude.toFixed(6);
        handleCoordManualChange(curLat, curLng);
      },
      (err) => {
        setIsLocating(false);
        alert('GPS orqali joylashuvni aniqlab bo\'lmadi: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Saqlash
  const handleSave = () => {
    if (onSave) {
      onSave({
        lat: Number(lat),
        lng: Number(lng),
        radiusMeters: Number(radiusMeters)
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sarlavhasi */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Maktab Binosi & Radiusini Xaritadan Belgilash</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  BigAdmin
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {school?.name || "Maktab binosi"} • Binoni ko'chirish uchun markerni suring, radiusni qo'l bilan chizing yoki tutqichdan torting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tarkibi */}
        <div className="p-4 space-y-3 overflow-y-auto">
          
          {/* Asboblar Paneli (Qo'l bilan chizish, Hozirgi lokatsiya, Standart markaz) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* 1. Qo'l bilan radius chizish rejimi tugmasi */}
              <button
                type="button"
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  isDrawingMode 
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 animate-pulse' 
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50'
                }`}
                title="Xaritada xohlagan nuqtani bosish orqali radiusni qo'l bilan belgilash"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{isDrawingMode ? '✏️ Xaritadan Radiusni Bosing' : '✏️ Radiusni Qo\'lda Chizish'}</span>
              </button>

              {/* 2. Tutqich haqida ma'lumot */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <MoveHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Yashil <b>↔</b> tutqichni sichqoncha bilan tortib cho'zishingiz mumkin</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Aniqlanmoqda...' : 'Mening GPS joylashuvim'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCoordManualChange(41.5515, 60.6315)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Urganch shahar markaziga qaytarish"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Markazga</span>
              </button>
            </div>
          </div>

          {/* Xabarnoma / Chizish yo'riqnomasi */}
          {isDrawingMode && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
              <Pencil className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <b>Qo'lda chizish faol:</b> Xaritaning istalgan joyiga (maktab darvozasi, ko'chasi yoki devoriga) bosing — markazdan o'sha nuqtagacha bo'lgan masofa avtomatik radius qilib belgilanadi!
              </span>
            </div>
          )}

          {drawMessage && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{drawMessage}</span>
            </div>
          )}

          {/* Xarita Container */}
          <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner">
            <div 
              ref={mapContainerRef} 
              className="w-full h-[340px] sm:h-[400px] z-10" 
            />

            {/* Xarita ostidagi jonli radius ko'rsatkichi */}
            <div className="absolute bottom-2 left-2 z-20 bg-slate-950/85 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-xs flex items-center gap-2 border border-white/10 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Yashil Hudud: <b className="text-emerald-300 font-mono text-sm">{radiusMeters} metr</b></span>
            </div>

            <div className="absolute top-2 left-2 z-20 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono backdrop-blur-xs border border-slate-300 dark:border-slate-700">
              🏫 {lat}, {lng}
            </div>
          </div>

          {/* Hudud Radiusi Slayderi & Tayyor Variantlar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Maktab Nazorat Radiusi (Metrda):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="1000"
                  step="5"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Math.max(30, Number(e.target.value)))}
                  className="w-20 px-2 py-0.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md outline-none text-xs"
                />
                <span className="font-bold text-slate-500">metr</span>
              </div>
            </div>

            <input
              type="range"
              min="30"
              max="600"
              step="5"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            {/* Tayyor radius presetlari */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Tezkor o'lchamlar:</span>
              {[80, 120, 150, 180, 220, 280, 350, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRadiusMeters(val)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                    radiusMeters === val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {val}m
                </button>
              ))}
            </div>
          </div>

          {/* Aniq Koordinatalar Kiritish (Kenglik / Uzunlik) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Kenglik (Latitude - Lat):
              </label>
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => handleCoordManualChange(Number(e.target.value), lng)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Uzunlik (Longitude - Lng):
              </label>
              <input
                type="number"
                step="0.000001"
                value={lng}
                onChange={(e) => handleCoordManualChange(lat, Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

        </div>

        {/* Modal Pastki Tugmalari */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Maktab: <b>{school?.name}</b> • Bino: <b>{lat}, {lng}</b>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Joylashuv va Radiusni Saqlash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
