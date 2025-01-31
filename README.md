POST /api/contributions/record
- Record new contribution
- Parameters: contributionType, metadata, impactScore

GET /api/contributions/:contributorAddress
- Get contributor's contributions history

GET /api/contributions/current-period
- Get current period's contributions


GET /api/points/:contributorAddress
- Get contributor's points balance
- Returns: totalPoints, currentMonthPoints

GET /api/points/config
- Get points configuration
- Returns: monthlyThreshold, reserveRatio

PUT /api/points/config
- Update points configuration (admin only)
- Parameters: monthlyThreshold, reserveRatio


POST /api/distribution/claim
- Claim tokens for contributor
- Parameters: contributorAddress

GET /api/distribution/periods
- Get distribution periods history

GET /api/distribution/current
- Get current distribution period stats
- Returns: totalTokens, tokensDistributed, periodPoints


POST /api/reserve/transfer
- Transfer tokens from reserve to distribution (admin only)
- Parameters: amount

POST /api/reserve/add
- Add tokens to reserve (admin only)
- Parameters: amount

GET /api/reserve/stats
- Get reserve statistics
- Returns: balance, distributionVaultBalance