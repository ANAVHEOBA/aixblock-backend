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





ab@ab:~/aixblock-backend$ curl -X POST http://localhost:3000/api/contributions/record -H "Content-Type: application/json" -d '{
  "contributorAddress": "EthU3J7hsudeXdTLRSSaoPQC7P75hD3r6ttPZF4uPaKK",
  "contributionType": "Code",
  "metadata": "Fixed authentication bug",
  "impactScore": 3
}'
{"success":true,"data":{"signature":"43iAJdFmFKjHL2EKaFuaN3GK5KURH2igozqHT5B18QuKRKcfstVhkPXJbMfeR2ySoziusfyZiBJPE6Tv7MCan5a7","contribution":{"contributorAddress":"EthU3J7hsudeXdTLRSSaoPQC7P75hD3r6ttPZF4uPaKK","contributionType":"Code","metadata":"Fixed authentication bug","impactScore":3,"timestamp":1738759994369}},"timestamp":1738759994369}ab@ab:~/aixblock-backend$ 



ab@ab:~/aixblock-backend$ curl -X GET http://localhost:3000/api/contributions/EthU3J7hsudeXdTLRSSaoPQC7P75hD3r6ttPZF4uPaKKPZF4uPaKK
{"success":true,"data":{"contributorAddress":"EthU3J7hsudeXdTLRSSaoPQC7P75hD3r6ttPZF4uPaKK","totalPoints":0,"contributions":[]},"timestamp":1738760295589}ab@ab:~/aixblock-backend$ 



ab@ab:~/aixblock-backend$ curl -X GET http://localhost:3000/api/contributions/current-period
{"success":true,"data":{"period":1,"contributions":[{"contributionAddress":"GxsGjxiDHt6e1ZK9NTWd415pAUdrR5o4xuPF76qCUfoW","contributorAddress":"7AK1y3MVmNBJ6fq53prj7ZBAA2j8PdARqsFKJdhZ3WPv","contributionType":"code","metadata":"Fixed authentication bug","impactScore":0,"timestamp":1738766921,"points":30},{"contributionAddress":"7vH1kT4TwbiCTTA2E5xnawoojsSeH5FZuUqofZ3fYBAH","contributorAddress":"7AK1y3MVmNBJ6fq53prj7ZBAA2j8PdARqsFKJdhZ3WPv","contributionType":"code","metadata":"Fixed authentication bug","impactScore":0,"timestamp":1738761361,"points":30},{"contributionAddress":"Fw41zoP3X7BZqoZd65ygRUXjGPapGP6vvTzZwqUVSKwc","contributorAddress":"7AK1y3MVmNBJ6fq53prj7ZBAA2j8PdARqsFKJdhZ3WPv","contributionType":"code","metadata":"Fixed authentication bug","impactScore":0,"timestamp":1738759992,"points":30},{"contributionAddress":"6PMpFwSz77Z4uYma2spVxkvgs3MUwEY7Ykc8K5yuKsNa","contributorAddress":"7AK1y3MVmNBJ6fq53prj7ZBAA2j8PdARqsFKJdhZ3WPv","contributionType":"code","metadata":"Fixed authentication bug","impactScore":0,"timestamp":1738759879,"points":30},{"contributionAddress":"6UpM7iRo6Smj3HnRctXp6WAwHHFTMubRngG4Smiiyyfg","contributorAddress":"7AK1y3MVmNBJ6fq53prj7ZBAA2j8PdARqsFKJdhZ3WPv","contributionType":"code","metadata":"Fixed authentication bug","impactScore":0,"timestamp":1738759374,"points":30}]},"timestamp":1738767469831}ab@ab:~/aixblock-backend$ 


ab@ab:~/aixblock-backend$ curl -X GET http://localhost:3000/api/reserve/stats
{"status":"success","data":{"balance":0,"distributionVaultBalance":0}}ab@ab:~/aixblock-backend$ 


ab@ab:~$      spl-token create-token
Creating token BCjmzUygrht6r8erHKc3U3fupbc5BzeotrR3sBUST9J2 under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Address:  
Decimals:  9

Signature: 3MmmDgRMtbmTS2qRqq5KVmkTYJRT1VgnQBVRH9d1ywXeGHdaFQfZ6JA9RZpb1SPqnTyQo1QzkNp6fpVVtjCZkVLj

ab@ab:~$ 

