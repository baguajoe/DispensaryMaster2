import React from 'react';

const LoyaltyStatus = () => {
    const loyaltyData = {
        points: 350,
        tier: 'Gold',
        rewards: ['10% Discount', 'Free Product Sample', 'Priority Service'],
        nextTier: 'Platinum',
        pointsToNextTier: 150
    };

    return (
        <div className="loyalty-status-section">
            <h2>Loyalty Program Status</h2>
            <p><strong>Points:</strong> {loyaltyData.points}</p>
            <p><strong>Tier:</strong> {loyaltyData.tier}</p>
            <p><strong>Next Tier:</strong> {loyaltyData.nextTier} (Earn {loyaltyData.pointsToNextTier} more points)</p>

            <h3>Available Rewards:</h3>
            <ul>
                {loyaltyData.rewards.map((reward, index) => (
                    <li key={index}>{reward}</li>
                ))}
            </ul>
        </div>
    );
};

export default LoyaltyStatus;
