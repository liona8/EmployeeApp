import React, { useState } from 'react';
import './HRPage.css';

const HRPage = () => {
  const [activeTab, setActiveTab] = useState('leave');

  const leaveBalance = {
    annual: 15,
    sick: 10,
    personal: 5
  };

  const salary = {
    basic: 5000,
    housing: 1500,
    transport: 500,
    total: 7000,
    nextPayDate: '2026-02-28'
  };

  return (
    <div className="hr-page">
      <h1>👥 HR Portal</h1>
      
      <div className="hr-tabs">
        <button 
          className={activeTab === 'leave' ? 'active' : ''} 
          onClick={() => setActiveTab('leave')}
        >
          Leave Balance
        </button>
        <button 
          className={activeTab === 'salary' ? 'active' : ''} 
          onClick={() => setActiveTab('salary')}
        >
          Salary Info
        </button>
        <button 
          className={activeTab === 'benefits' ? 'active' : ''} 
          onClick={() => setActiveTab('benefits')}
        >
          Benefits
        </button>
      </div>

      <div className="hr-content">
        {activeTab === 'leave' && (
          <div className="leave-section">
            <h2>Leave Balance</h2>
            <div className="balance-cards">
              <div className="balance-card">
                <span className="balance-label">Annual Leave</span>
                <span className="balance-value">{leaveBalance.annual}</span>
                <span className="balance-unit">days</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Sick Leave</span>
                <span className="balance-value">{leaveBalance.sick}</span>
                <span className="balance-unit">days</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Personal Leave</span>
                <span className="balance-value">{leaveBalance.personal}</span>
                <span className="balance-unit">days</span>
              </div>
            </div>
            <button className="apply-btn">Apply for Leave</button>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="salary-section">
            <h2>Salary Information</h2>
            <div className="salary-breakdown">
              <div className="salary-item">
                <span>Basic Salary</span>
                <span>${salary.basic}</span>
              </div>
              <div className="salary-item">
                <span>Housing Allowance</span>
                <span>${salary.housing}</span>
              </div>
              <div className="salary-item">
                <span>Transport Allowance</span>
                <span>${salary.transport}</span>
              </div>
              <div className="salary-item total">
                <span>Total Monthly</span>
                <span>${salary.total}</span>
              </div>
            </div>
            <p className="next-pay">Next Pay Date: {salary.nextPayDate}</p>
            <button className="download-btn">Download Payslip</button>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="benefits-section">
            <h2>Employee Benefits</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">🏥</span>
                <div>
                  <h3>Health Insurance</h3>
                  <p>Comprehensive medical, dental, and vision coverage</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💰</span>
                <div>
                  <h3>401(k) Matching</h3>
                  <p>5% company match on retirement contributions</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📚</span>
                <div>
                  <h3>Learning & Development</h3>
                  <p>$1,000 annual education stipend</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRPage;