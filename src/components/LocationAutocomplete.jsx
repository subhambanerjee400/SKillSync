import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import { CITIES } from '../data/cities';

const POPULAR_CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Bhubaneswar', 'Pune', 'Hyderabad'];

export default function LocationAutocomplete({
  value = '',
  onChange,
  placeholder = 'e.g. Bengaluru, Delhi, or Mumbai',
  required = false,
  disabled = false,
  id,
  name,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter cities based on user input
  const query = (value || '').trim().toLowerCase();
  const matchingCities = query
    ? CITIES.filter((city) => city.toLowerCase().includes(query))
    : POPULAR_CITIES;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (matchingCities.length === 0) return;
      setHighlightedIndex((prev) =>
        prev < matchingCities.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (matchingCities.length === 0) return;
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : matchingCities.length - 1
      );
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && matchingCities[highlightedIndex]) {
        e.preventDefault();
        handleSelectCity(matchingCities[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectCity = (city) => {
    if (onChange) {
      onChange(city);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Helper to highlight matching substring in city name
  const renderCityLabel = (cityName) => {
    if (!query) return <span>{cityName}</span>;
    const lower = cityName.toLowerCase();
    const matchIndex = lower.indexOf(query);
    if (matchIndex === -1) return <span>{cityName}</span>;

    const before = cityName.slice(0, matchIndex);
    const match = cityName.slice(matchIndex, matchIndex + query.length);
    const after = cityName.slice(matchIndex + query.length);

    return (
      <span>
        {before}
        <strong style={{ color: '#065f46', background: '#d1fae5', borderRadius: '2px', padding: '0 1px' }}>
          {match}
        </strong>
        {after}
      </span>
    );
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <MapPin
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          autoComplete="off"
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            minHeight: '44px',
            padding: '0.65rem 0.85rem 0.65rem 2.4rem',
            fontSize: '0.9rem',
            border: isOpen ? '1px solid #10b981' : '1px solid #cbd5e1',
            borderRadius: '8px',
            outline: 'none',
            boxSizing: 'border-box',
            color: '#0f172a',
            background: '#ffffff',
            boxShadow: isOpen ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        />
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && matchingCities.length > 0 && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 50,
            padding: '0.25rem 0',
          }}
        >
          <div
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            Suggested Cities
          </div>
          {matchingCities.map((city, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = (value || '').trim().toLowerCase() === city.toLowerCase();

            return (
              <div
                key={city}
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents input blur before selection
                  handleSelectCity(city);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '44px',
                  padding: '0.55rem 0.85rem',
                  boxSizing: 'border-box',
                  fontSize: '0.875rem',
                  color: isHighlighted ? '#065f46' : '#1e293b',
                  background: isHighlighted ? '#ecfdf5' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} color={isHighlighted ? '#10b981' : '#94a3b8'} />
                  {renderCityLabel(city)}
                </div>
                {isSelected && <Check size={14} color="#10b981" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
