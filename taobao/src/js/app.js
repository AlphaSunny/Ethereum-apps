App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // initialize web3
    if(typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    });
  },

  initContract: function() {
    $.getJSON('Taobao.json', function(TaobaoArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.Taobao = TruffleContract(TaobaoArtifact);
      // set the provider for our contracts
      App.contracts.Taobao.setProvider(App.web3Provider);
      // listen to events
      App.listenToEvents();
      // retrieve the Merch from the contract
      return App.reloadMerchs();
    });
  },

  reloadMerchs: function() {
    // avoid reentry
    if(App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance might have changed
    App.displayAccountInfo();

    var TaobaoInstance;

    App.contracts.Taobao.deployed().then(function(instance) {
      TaobaoInstance = instance;
      return TaobaoInstance.getMerchsForSale();
    }).then(function(MerchIds) {
      // retrieve the Merch placeholder and clear it
      $('#MerchsRow').empty();

      for(var i = 0; i < MerchIds.length; i++) {
        var MerchId = MerchIds[i];
        TaobaoInstance.Merchs(MerchId.toNumber()).then(function(Merch){
          App.displayMerch(Merch[0], Merch[1], Merch[3], Merch[4], Merch[5]);
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  displayMerch: function(id, seller, name, description, price) {
    var MerchsRow = $('#MerchsRow');

    var etherPrice = web3.fromWei(price, "ether");

    var MerchTemplate = $("#MerchTemplate");
    MerchTemplate.find('.panel-title').text(name);
    MerchTemplate.find('.Merch-description').text(description);
    MerchTemplate.find('.Merch-price').text(etherPrice + " ETH");
    MerchTemplate.find('.btn-buy').attr('data-id', id);
    MerchTemplate.find('.btn-buy').attr('data-value', etherPrice);

    // seller
    if (seller == App.account) {
      console.log("yes");
      MerchTemplate.find('.Merch-seller').text("You");
      MerchTemplate.find('.btn-buy').hide();
    } else {
      MerchTemplate.find('.Merch-seller').text(seller);
      MerchTemplate.find('.btn-buy').show();
    }

    // add this new Merch
    MerchsRow.append(MerchTemplate.html());
  },

  sellMerch: function() {
    // retrieve the detail of the Merch
    var _Merch_name = $('#Merch_name').val();
    var _description = $('#Merch_description').val();
    var _price = web3.toWei(parseFloat($('#Merch_price').val() || 0), "ether");

    if((_Merch_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    App.contracts.Taobao.deployed().then(function(instance) {
      return instance.sellMerch(_Merch_name, _description, _price, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.Taobao.deployed().then(function(instance) {
      instance.LogSellMerch({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
        } else {
          console.error(error);
        }
        App.reloadMerchs();
      });

      instance.LogBuyMerch({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadMerchs();
      });
    });
  },

  buyMerch: function() {
    event.preventDefault();

    // retrieve the Merch
    var _MerchId = $(event.target).data('id');
    var _price = parseFloat($(event.target).data('value'));

    App.contracts.Taobao.deployed().then(function(instance){
      return instance.buyMerch(_MerchId, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      });
    }).catch(function(error) {
      console.error(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
