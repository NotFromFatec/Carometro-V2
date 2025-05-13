// src/components/AutocompleteInput.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, ListGroup, Image, Spinner, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Egresso } from '../api';

interface AutocompleteInputProps {
    suggestionsData: Egresso[];
    onSuggestionClickNavigate?: (egressoId: string) => void; // For direct navigation on item click
    onTermSubmit?: (term: string) => void; // For submitting the current input term (on Enter or button click)
    initialValue?: string;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    isLoadingData?: boolean;
    showSubmitButton?: boolean;
    submitButtonText?: string;
    onInputChange?: (value: string) => void; // To update parent's state for the input value
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    suggestionsData,
    onSuggestionClickNavigate,
    onTermSubmit,
    initialValue = '',
    placeholder = "Buscar...",
    className = '',
    inputClassName = '',
    isLoadingData = false,
    showSubmitButton = false,
    submitButtonText = "Buscar",
    onInputChange
}) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const [filteredSuggestions, setFilteredSuggestions] = useState<Egresso[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(initialValue); // Sync if initialValue changes from parent
    }, [initialValue]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const userInput = e.currentTarget.value;
        setInputValue(userInput);
        if (onInputChange) {
            onInputChange(userInput);
        }
        setActiveIndex(-1);

        if (userInput.length > 0) { // Suggest even with 1 char
            const lowerUserInput = userInput.toLowerCase();
            const filtered = suggestionsData.filter(
                suggestion =>
                    suggestion.name.toLowerCase().includes(lowerUserInput) ||
                    suggestion.course?.toLowerCase().includes(lowerUserInput)
            ).slice(0, 7);
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionItemClick = (egressoId: string) => {
        if (onSuggestionClickNavigate) {
            setInputValue(''); // Clear input on direct navigation
            if (onInputChange) onInputChange('');
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            onSuggestionClickNavigate(egressoId);
        }
    };

    const handleSubmitCurrentTerm = () => {
        if (onTermSubmit) {
            setShowSuggestions(false); // Hide suggestions when term is submitted
            onTermSubmit(inputValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && filteredSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex(prevIndex => (prevIndex + 1) % filteredSuggestions.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex(prevIndex => (prevIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
                    // If a suggestion is highlighted, treat Enter as clicking it
                    handleSuggestionItemClick(filteredSuggestions[activeIndex].id!);
                } else if (onTermSubmit) {
                    // If no suggestion highlighted, treat Enter as submitting the current term
                    handleSubmitCurrentTerm();
                }
            } else if (e.key === "Escape") {
                setShowSuggestions(false);
            }
        } else if (e.key === "Enter" && onTermSubmit) { // Enter pressed with no suggestions visible
            e.preventDefault();
            handleSubmitCurrentTerm();
        }
    };

    const highlightMatch = (text: string, highlight: string) => {
        if (!highlight.trim() || !text) { 
            return <span>{text || ''}</span>;
        }
        const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <strong key={i} className="autocomplete-highlight">{part}</strong>
                    ) : (part)
                )}
            </span>
        );
    };

    return (
        <div ref={wrapperRef} className={`autocomplete-wrapper ${className}`}>
            <InputGroup>
                <Form.Control
                    type="text"
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    value={inputValue}
                    placeholder={isLoadingData ? "Carregando..." : placeholder}
                    className={`form-control-modern ${inputClassName}`}
                    disabled={isLoadingData}
                    onFocus={() => { if (inputValue.length > 0 && filteredSuggestions.length > 0) setShowSuggestions(true); }}
                />
                {showSubmitButton && onTermSubmit && (
                    <Button variant="outline-primary" className="btn-modern" onClick={handleSubmitCurrentTerm} disabled={isLoadingData}>
                        {submitButtonText}
                    </Button>
                )}
            </InputGroup>
            {isLoadingData && !showSubmitButton && <Spinner animation="border" size="sm" className="autocomplete-spinner" />}

            {showSuggestions && filteredSuggestions.length > 0 && (
                <ListGroup className="autocomplete-suggestions-list shadow-lg">
                    {filteredSuggestions.map((suggestion, index) => (
                        <ListGroup.Item
                            key={suggestion.id}
                            action
                            onClick={() => handleSuggestionItemClick(suggestion.id!)}
                            active={index === activeIndex}
                            className="d-flex align-items-center autocomplete-suggestion-item"
                        >
                            <Image src={suggestion.profileImage || "/placeholder.png"} roundedCircle className="me-2 autocomplete-suggestion-image" alt={suggestion.name} />
                            <div className="autocomplete-suggestion-text">
                                <div className="fw-medium">{highlightMatch(suggestion.name, inputValue)}</div>
                                <small className="text-muted d-block">{highlightMatch(suggestion.course || '', inputValue)}</small>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
            {showSuggestions && inputValue.length > 0 && filteredSuggestions.length === 0 && !isLoadingData && (
                <ListGroup className="autocomplete-suggestions-list shadow-lg">
                    <ListGroup.Item className="text-muted text-center py-2">
                        Nenhum resultado para "{inputValue}"
                    </ListGroup.Item>
                </ListGroup>
            )}
        </div>
    );
};

export default AutocompleteInput;