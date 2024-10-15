import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MeetingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email } = location.state || {};

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [error, setError] = useState('');
  const [eventLog, setEventLog] = useState([]);
  const [score, setScore] = useState(0);

  const eventPoints = {
    windowControl: 10, 
    tabSwitch: 10,
    copyPaste: 5,
    cameraOff: 20,
  };

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Unable to access the camera. Please check your settings.');
      }
    };

    const handleWindowBlur = () => {
      logEvent('windowControl');
    };

    const handleWindowFocus = () => {
      logEvent('windowControl');
    };

    const handleWindowResize = () => {
      logEvent('windowControl');
    };

    const handleCopyPaste = () => {
      logEvent('copyPaste');
    };

    const logEvent = (type) => {
      const timestamp = new Date().toISOString();
      const newEvent = { type, timestamp };
      setEventLog((prevLog) => {
        const updatedLog = [...prevLog, newEvent];
        calculateScore(updatedLog);
        return updatedLog;
      });
    };

    const addEventListeners = () => {
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('resize', handleWindowResize);
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('cut', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);
      window.addEventListener('beforeunload', handleBeforeUnload);
    };

    const removeEventListeners = () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

    const handleBeforeUnload = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };

    getCameraStream();
    addEventListeners();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      removeEventListeners();
    };
  }, []);

  useEffect(() => {
    if (!name || !email) {
      navigate('/');
    }
  }, [name, email, navigate]);

  const calculateScore = (updatedLog) => {
    let totalPoints = 0;
    updatedLog.forEach((event) => {
      if (eventPoints[event.type]) {
        totalPoints += eventPoints[event.type];
      }
    });
    totalPoints = Math.min(totalPoints, 100);
    setScore(totalPoints);
  };

  const generateAndDownloadJSON = () => {
    const data = {
      user: { name, email },
      events: eventLog,
      summary: {
        windowControls: eventLog.filter((e) => e.type === 'windowControl').length,
        copyPastes: eventLog.filter((e) => e.type === 'copyPaste').length,
        score,
      },
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_meeting_log.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLeaveMeeting = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    calculateScore(eventLog);
    setTimeout(() => {
      generateAndDownloadJSON();
      navigate('/');
    }, 1000);
  };

  return (
    <div className="container">
      <h1>Meeting in Progress</h1>
      {name && email ? (
        <div>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Email:</strong> {email}</p>
          <div className="video-container">
            {error ? (
              <div className="error">
                <p>{error}</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted />
            )}
          </div>
          <div className="score-container">
            <h2>Cheating Score: {score} / 100</h2>
          </div>
          <button className="leave-button" onClick={handleLeaveMeeting}>
            Leave Meeting
          </button>
        </div>
      ) : (
        <p>No meeting data available. Please go back and start a meeting.</p>
      )}
    </div>
  );
};

export default MeetingPage;
