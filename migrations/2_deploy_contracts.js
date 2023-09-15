const Voting = artifacts.require('Voting');

module.exports = async function(deployer){
    await deployer.deploy(Voting, 1693414053, 1694018853);
};