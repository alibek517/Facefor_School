import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Building2, 
  MapPin, 
  Check, 
  Pencil, 
  Navigation, 
  RotateCcw, 
  Sliders, 
  Compass, 
  Save, 
  MoveHorizontal,
  Info,
  CheckCircle2
} from 'lucide-react';
import { SCHOOL_DEFAULT_COORDS } from '../utils/teacherLocationService';

function getHandleLatLng(centerLat, centerLng, radius) {
  const metersPerDegreeLon = 111320 * Math.cos((centerLat * Math.PI) / 180);
  const dLng = radius / metersPerDegreeLon;
  return [centerLat, centerLng + dLng];
}

export const BigAdminSchoolMapView = ({
  schools = [],
  selectedSchoolId,
  updateSchool,
  showToast
}) => {
  const [currentSelectedId, setCurrentSelectedId] = useState(
    selectedSchoolId || schools[0]?.id || 'sch-1'
  );

  const selectedSchool = useMemo(() => {
    return schools.find(s => s.id === currentSelectedId) || schools[0] || null;
  }, [schools, currentSelectedId]);

  const [lat, setLat] = useState(
    Number(selectedSchool?.lat) || SCHOOL_DEFAULT_COORDS.lat || 41.5515
  );
  const [lng, setLng] = useState(
    Number(selectedSchool?.lng) || SCHOOL_DEFAULT_COORDS.lng || 60.6315
  );
  const [radiusMeters, setRadiusMeters] = useState(
    Number(selectedSchool?.radiusMeters || selectedSchool?.radius) || 180
  );

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const centerMarkerRef = useRef(null);
  const circleRef = useRef(null);
  const handleMarkerRef = useRef(null);
  const otherSchoolsLayerRef = useRef(null);

  // Tanlangan maktab o'zgarganda koordinatalarni yangilash
  useEffect(() => {
    if (selectedSchool) {
      const sLat = Number(selectedSchool.lat) || 41.5515;
      const sLng = Number(selectedSchool.lng) || 60.6315;
      const sRad = Number(selectedSchool.radiusMeters || selectedSchool.radius) || 180;
      setLat(sLat);
      setLng(sLng);
      setRadiusMeters(sRad);
      setIsDrawingMode(false);
      setSavedSuccessMsg('');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([sLat, sLng]);
        if (centerMarkerRef.current) centerMarkerRef.current.setLatLng([sLat, sLng]);
        if (circleRef.current) {
          circleRef.current.setLatLng([sLat, sLng]);
          circleRef.current.setRadius(sRad);
        }
        if (handleMarkerRef.current) {
          handleMarkerRef.current.setLatLng(getHandleLatLng(sLat, sLng, sRad));
        }
      }
    }
  }, [selectedSchool?.id]);

  // Leaflet Xaritasini yaratish
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Yashil hudud doirasi
      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.18,
        weight: 2.5,
        dashArray: '6, 6'
      }).addTo(map);
      circleRef.current = circle;

      // Maktab binosi markazi markeri (drag qilinadi)
      const schoolIcon = L.divIcon({
        className: 'custom-bigadmin-school-pin',
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

      const centerMarker = L.marker([lat, lng], {
        icon: schoolIcon,
        draggable: true,
        zIndexOffset: 500
      }).addTo(map);
      centerMarkerRef.current = centerMarker;

      // Radiusni qo'l bilan cho'zish uchun tutqich markeri (drag qilinadi)
      const handleIcon = L.divIcon({
        className: 'custom-radius-handle-pin',
        html: `
          <div style="background:#10b981; color:#ffffff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 12px rgba(16,185,129,0.5); border:2.5px solid #ffffff; cursor:ew-resize; font-size:14px; font-weight:bold;">
            ↔
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const handlePos = getHandleLatLng(lat, lng, radiusMeters);
      const handleMarker = L.marker(handlePos, {
        icon: handleIcon,
        draggable: true,
        zIndexOffset: 1000
      }).addTo(map);

      handleMarker.bindTooltip(`Radius: ${radiusMeters}m (Qo'l bilan suring)`, {
        permanent: false,
        direction: 'top'
      });
      handleMarkerRef.current = handleMarker;

      // Markaz markeri surilganda
      centerMarker.on('drag', (e) => {
        const cur = e.target.getLatLng();
        circle.setLatLng(cur);
        const curR = circle.getRadius();
        handleMarker.setLatLng(getHandleLatLng(cur.lat, cur.lng, curR));
      });

      centerMarker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        const newLat = +newPos.lat.toFixed(6);
        const newLng = +newPos.lng.toFixed(6);
        setLat(newLat);
        setLng(newLng);
        circle.setLatLng([newLat, newLng]);
        const curR = circle.getRadius();
        handleMarker.setLatLng(getHandleLatLng(newLat, newLng, curR));
      });

      // Tutqich marker surilganda (radiusni qo'l bilan cho'zish)
      handleMarker.on('drag', (e) => {
        const cPos = centerMarker.getLatLng();
        const curH = e.target.getLatLng();
        const dist = Math.round(cPos.distanceTo(curH));
        const clamped = Math.max(30, Math.min(1000, dist));
        setRadiusMeters(clamped);
        circle.setRadius(clamped);
        handleMarker.setTooltipContent(`Radius: ${clamped} metr`);
        handleMarker.openTooltip();
      });

      handleMarker.on('dragend', (e) => {
        const cPos = centerMarker.getLatLng();
        const curH = e.target.getLatLng();
        const dist = Math.round(cPos.distanceTo(curH));
        const clamped = Math.max(30, Math.min(1000, dist));
        setRadiusMeters(clamped);
        circle.setRadius(clamped);
        handleMarker.setLatLng(getHandleLatLng(cPos.lat, cPos.lng, clamped));
      });

      // Xaritada bosilganda
      map.on('click', (e) => {
        const clickPos = e.latlng;
        const cPos = centerMarker.getLatLng();

        // Agar "Qo'l bilan chizish" rejimi faol bo'lsa:
        if (mapContainerRef.current?.getAttribute('data-drawing-mode') === 'true') {
          const dist = Math.round(cPos.distanceTo(clickPos));
          const newRadius = Math.max(30, Math.min(1000, dist));
          setRadiusMeters(newRadius);
          circle.setRadius(newRadius);
          handleMarker.setLatLng(getHandleLatLng(cPos.lat, cPos.lng, newRadius));
          setSavedSuccessMsg(`✏️ Maktab hududi radiusi qo'lda belgilandi: ${newRadius} metr!`);
          setTimeout(() => setSavedSuccessMsg(''), 4000);
          return;
        }

        // Oddiy bosilganda markazni yangi joyga ko'chirish
        const clickLat = +clickPos.lat.toFixed(6);
        const clickLng = +clickPos.lng.toFixed(6);
        setLat(clickLat);
        setLng(clickLng);
        centerMarker.setLatLng([clickLat, clickLng]);
        circle.setLatLng([clickLat, clickLng]);
        const curR = circle.getRadius();
        handleMarker.setLatLng(getHandleLatLng(clickLat, clickLng, curR));
      });

      otherSchoolsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Boshqa maktablarni xaritada fon sifatida ko'rsatish
  useEffect(() => {
    if (!otherSchoolsLayerRef.current) return;
    otherSchoolsLayerRef.current.clearLayers();

    schools.forEach(sch => {
      if (sch.id === currentSelectedId) return;
      const sLat = Number(sch.lat) || 41.5515;
      const sLng = Number(sch.lng) || 60.6315;
      const sRad = Number(sch.radiusMeters || sch.radius) || 180;

      // Doira
      L.circle([sLat, sLng], {
        radius: sRad,
        color: '#64748b',
        fillColor: '#94a3b8',
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '3, 3'
      }).addTo(otherSchoolsLayerRef.current);

      // Kichik marker
      const otherIcon = L.divIcon({
        className: 'custom-other-school-pin',
        html: `
          <div style="background:#475569; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:2px solid #fff; font-size:14px; cursor:pointer;">
            🏫
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([sLat, sLng], { icon: otherIcon })
        .addTo(otherSchoolsLayerRef.current);

      m.bindPopup(`
        <div style="font-family:sans-serif; padding:2px;">
          <b>${sch.name}</b><br/>
          <span style="font-size:11px; color:#64748b;">${sch.address || ''}</span><br/>
          <button style="margin-top:6px; padding:3px 8px; font-size:11px; background:#2563eb; color:#fff; border:none; border-radius:4px; cursor:pointer;" id="select-sch-${sch.id}">
            Ushbu maktabni tahrirlash
          </button>
        </div>
      `);

      m.on('popupopen', () => {
        const btn = document.getElementById(`select-sch-${sch.id}`);
        if (btn) {
          btn.onclick = () => {
            setCurrentSelectedId(sch.id);
            m.closePopup();
          };
        }
      });
    });
  }, [schools, currentSelectedId]);

  // Radius o'zgarganda Leaflet doira va tutqichni yangilash
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters);
    }
    if (centerMarkerRef.current && handleMarkerRef.current) {
      const c = centerMarkerRef.current.getLatLng();
      handleMarkerRef.current.setLatLng(getHandleLatLng(c.lat, c.lng, radiusMeters));
    }
  }, [radiusMeters]);

  // Qo'l bilan chizish rejimi o'zgarganda DOM kursorini almashtirish
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.setAttribute('data-drawing-mode', isDrawingMode ? 'true' : 'false');
      mapContainerRef.current.style.cursor = isDrawingMode ? 'crosshair' : 'default';
    }
  }, [isDrawingMode]);

  // Koordinatalarni qo'lda kiritish
  const handleCoordManualChange = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    if (centerMarkerRef.current) centerMarkerRef.current.setLatLng([newLat, newLng]);
    if (circleRef.current) circleRef.current.setLatLng([newLat, newLng]);
    if (handleMarkerRef.current) handleMarkerRef.current.setLatLng(getHandleLatLng(newLat, newLng, radiusMeters));
    if (mapInstanceRef.current) mapInstanceRef.current.panTo([newLat, newLng]);
  };

  // Hozirgi joylashuvni aniqlash
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('GPS qo\'llab-quvvatlanmaydi.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const cLat = +pos.coords.latitude.toFixed(6);
        const cLng = +pos.coords.longitude.toFixed(6);
        handleCoordManualChange(cLat, cLng);
      },
      (err) => {
        setIsLocating(false);
        alert('GPS xatosi: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Maktab koordinatalari va radiusini saqlash
  const handleSave = async () => {
    if (!selectedSchool) return;
    setIsSaving(true);
    try {
      if (updateSchool) {
        await updateSchool({
          id: selectedSchool.id,
          lat: Number(lat),
          lng: Number(lng),
          radiusMeters: Number(radiusMeters)
        });
      }
      setSavedSuccessMsg(`✅ "${selectedSchool.name}" binosi (${lat}, ${lng}) va radiusi (${radiusMeters}m) muvaffaqiyatli saqlandi!`);
      if (showToast) {
        showToast('Saqlandi', `"${selectedSchool.name}" joylashuvi va radiusi saqlandi!`, 'success');
      }
      setTimeout(() => setSavedSuccessMsg(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Yuqori Sozlamalar va Maktab Tanlagichi */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tahrirlanadigan maktab:</span>
              <select
                value={currentSelectedId}
                onChange={(e) => setCurrentSelectedId(e.target.value)}
                className="text-sm font-black px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 outline-none cursor-pointer shadow-2xs"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code || 'SCH'})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedSchool?.address || "Manzil ko'rsatilmagan"} • Direktor: {selectedSchool?.director || 'Tayinlanmagan'}
            </p>
          </div>
        </div>

        {/* Amallar: Qo'lda chizish, GPS, Saqlash */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isDrawingMode 
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Xaritaning istalgan joyini bosish orqali radiusni qo'lda belgilash"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isDrawingMode ? '✏️ Xaritadan Chegarani Bosing' : '✏️ Radiusni Qo\'lda Chizish'}</span>
          </button>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Mening hozirgi GPS lokatsiyamni belgilash"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Aniqlanmoqda...' : 'Mening GPS joylashuvim'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saqlanmoqda...' : 'Joylashuv & Radiusni Saqlash'}</span>
          </button>
        </div>
      </div>

      {/* Yo'riqnoma yoki Muvaffaqiyat xabari */}
      {isDrawingMode && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Pencil className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <b>Qo'lda radius chizish faol:</b> Xaritada maktabingiz darvozasi, ko'chasi yoki devoriga bosing — maktab binosidan bosilgan joygacha bo'lgan masofa avtomatik radius qilib belgilanadi!
          </span>
        </div>
      )}

      {savedSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* 2. Asosiy Interaktiv Xarita Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[520px] z-10" 
        />

        {/* Xarita ustidagi ma'lumot qatlami */}
        <div className="absolute bottom-3 left-3 z-20 bg-slate-950/90 text-white px-3.5 py-2 rounded-xl text-xs font-bold backdrop-blur-xs flex items-center gap-2.5 border border-white/10 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Nazorat Radiusi: <b className="text-emerald-300 font-mono text-sm">{radiusMeters} metr</b></span>
          <span className="text-white/40">|</span>
          <span className="text-[11px] text-white/80 font-mono">GPS: {lat}, {lng}</span>
        </div>

        <div className="absolute top-3 right-3 z-20 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-2">
          <MoveHorizontal className="w-4 h-4 text-emerald-600" />
          <span>Aylanadagi <b>↔</b> yashil tutqichni tortib cho'zishingiz mumkin</span>
        </div>
      </div>

      {/* 3. Radius Slayderi, Tayyor O'lchamlar va Aniq Koordinatalar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Radius Boshqaruvi */}
        <div className="md:col-span-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Maktab Hududi Radiusi (Yashil zona):</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="30"
                max="1000"
                step="5"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Math.max(30, Number(e.target.value)))}
                className="w-20 px-2 py-0.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-xs"
              />
              <span className="font-bold text-slate-500 text-xs">metr</span>
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

          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-[11px] text-slate-400">Tezkor o'lchamlar:</span>
            {[80, 120, 150, 180, 220, 280, 350, 500].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setRadiusMeters(val)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                  radiusMeters === val
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {val}m
              </button>
            ))}
          </div>
        </div>

        {/* Aniq Koordinatalar */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Kenglik & Uzunlik:</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] text-slate-400 block">Kenglik (Lat):</span>
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => handleCoordManualChange(Number(e.target.value), lng)}
                className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Uzunlik (Lng):</span>
              <input
                type="number"
                step="0.000001"
                value={lng}
                onChange={(e) => handleCoordManualChange(lat, Number(e.target.value))}
                className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
