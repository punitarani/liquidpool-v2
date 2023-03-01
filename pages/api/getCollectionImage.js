// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Parsing the tokenURI to get the image link

export default async function handler(req, res) {
    // Query format: /api/getCollectionImage?nftCollection=0xd9b78A2F1dAFc8Bb9c60961790d2beefEBEE56f4&id=1&thrumbnail=true

    const param = req.query

    // Check if the address is valid
    function isValidAddress(address) {
      return /^(0x)?[0-9a-f]{40}$/i.test(address);
    }
    const nftCollection = param.nftCollection
    const id = param.id
    if(!isValidAddress(nftCollection)){
      res.status(400).json({error:'Invalid address'})
      return
    }
    try{
      const query_url = `${process.env.ALCHEMY_URL}/getNFTMetadata?contractAddress=${nftCollection}&tokenId=${id}&refreshCache=false`
      const response = await (await fetch(query_url)).json()
      let imageLink
      if(param.thumbnail){
        imageLink = response.media[0].thumbnail
      }else{
        imageLink = response.media[0].gateway
      }

      const imageResponse = await fetch(imageLink)
      const imageBuffer = await imageResponse.buffer();
      res.setHeader('Content-Type', imageResponse.headers.get('Content-Type'));
      res.status(200);
      res.send(imageBuffer);

    }catch(err){
        console.log(err);
        res.status(400).json({error:err})
    }
    
}
  