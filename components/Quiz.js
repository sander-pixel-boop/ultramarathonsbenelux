import React, { useState } from 'react';

function parseDistance(distStr) {
    if (!distStr) return 0;
    distStr = distStr.toLowerCase();
    let num = parseFloat(distStr.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 0;
    if (distStr.includes("mi")) {
        num = num * 1.60934;
    } else if (distStr.includes("h")) {
        // approximate distance for hours, e.g. 10km/h
        num = num * 10;
    }
    return num;
}

export default function Quiz({ races, onClose, onSelectRace, t }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        longestRun: '',
        nightRunning: '',
        mudPreference: ''
    });

    const [results, setResults] = useState([]);

    const handleAnswer = (field, value) => {
        const newAnswers = { ...answers, [field]: value };
        setAnswers(newAnswers);

        if (step < 2) {
            setStep(step + 1);
        } else {
            calculateResults(newAnswers);
            setStep(3);
        }
    };

    const calculateResults = (finalAnswers) => {
        // filter logic
        const scoredRaces = races.map(race => {
            let score = 0;
            const dist = parseDistance(race.distance);
            const nameLower = race.name.toLowerCase();
            const isTimed = String(race.distance).toLowerCase().includes('h');

            // 1. Longest run -> target distance
            if (finalAnswers.longestRun === 'short') {
                if (dist >= 40 && dist <= 60 && !isTimed) score += 10;
                else if (dist > 60) score -= 10; // Too long for beginners
            } else if (finalAnswers.longestRun === 'medium') {
                if (dist >= 60 && dist <= 90) score += 10;
            } else if (finalAnswers.longestRun === 'long') {
                if (dist >= 90 || isTimed) score += 10;
            }

            // 2. Night running
            // Assuming races > 80km or timed >= 12h involve night
            const involvesNight = dist >= 80 || (isTimed && parseFloat(race.distance) >= 12);
            if (finalAnswers.nightRunning === 'no' && involvesNight) {
                score -= 20; // Heavily penalize
            } else if (finalAnswers.nightRunning === 'yes' && involvesNight) {
                score += 5;
            }

            // 3. Mud/Technical preference
            const isTrail = nameLower.includes('trail') || nameLower.includes('mud') || nameLower.includes('nature') || nameLower.includes('forest');
            if (finalAnswers.mudPreference === 'yes') {
                if (isTrail) score += 10;
            } else {
                if (isTrail) score -= 10;
                else score += 10;
            }

            return { ...race, score };
        });

        // Sort by score descending
        scoredRaces.sort((a, b) => b.score - a.score);

        // Return top 3
        setResults(scoredRaces.slice(0, 3));
    };

    return (
        <div className="quiz-container" style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0f172a' }}>Find my Race</h2>
                <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            {step === 0 && (
                <div>
                    <h3 style={{ color: '#334155' }}>1. What is your current longest run?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                        <button className="quiz-btn" onClick={() => handleAnswer('longestRun', 'short')}>Half Marathon or less (&lt; 21km)</button>
                        <button className="quiz-btn" onClick={() => handleAnswer('longestRun', 'medium')}>Up to a Marathon (21km - 42km)</button>
                        <button className="quiz-btn" onClick={() => handleAnswer('longestRun', 'long')}>Ultra Distance (&gt; 42km)</button>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div>
                    <h3 style={{ color: '#334155' }}>2. Are you comfortable with night running?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                        <button className="quiz-btn" onClick={() => handleAnswer('nightRunning', 'yes')}>Yes, bring on the night!</button>
                        <button className="quiz-btn" onClick={() => handleAnswer('nightRunning', 'no')}>No, I prefer daylight.</button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 style={{ color: '#334155' }}>3. Do you like mud and technical trails?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                        <button className="quiz-btn" onClick={() => handleAnswer('mudPreference', 'yes')}>Yes, the dirtier the better!</button>
                        <button className="quiz-btn" onClick={() => handleAnswer('mudPreference', 'no')}>No, keep it relatively flat or paved.</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h3 style={{ color: '#334155', marginBottom: '20px' }}>Your Top 3 Recommended Races:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {results.length > 0 ? results.map((race, idx) => (
                            <div key={idx}
                                style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', backgroundColor: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => onSelectRace(race)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>{race.name}</h4>
                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9em', color: '#475569' }}>
                                    <span><i className="fas fa-route"></i> {race.distance}</span>
                                    <span><i className="far fa-calendar-alt"></i> {race.date}</span>
                                </div>
                            </div>
                        )) : (
                            <p>No suitable races found based on your preferences.</p>
                        )}
                    </div>
                    <button className="quiz-btn" style={{ marginTop: '20px', backgroundColor: '#94a3b8' }} onClick={() => { setStep(0); setAnswers({}); }}>Retake Quiz</button>
                </div>
            )}

            <style jsx>{`
                .quiz-btn {
                    padding: 12px 20px;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    text-align: left;
                }
                .quiz-btn:hover {
                    background-color: #2563eb;
                }
            `}</style>
        </div>
    );
}
