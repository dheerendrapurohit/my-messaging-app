exports.sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const { userId } = req.user; 
  
    try {
      const message = await prisma.message.create({
        data: { content, senderId: userId, receiverId },
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  };
  
  exports.getMessages = async (req, res) => {
    const { receiverId } = req.params;
    const { userId } = req.user;
  
    try {
      const messages = await prisma.message.findMany({
        where: { OR: [{ senderId: userId, receiverId }, { senderId: receiverId, receiverId: userId }] },
        orderBy: { timestamp: 'asc' }
      });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  };
  