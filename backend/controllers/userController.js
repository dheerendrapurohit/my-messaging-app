exports.updateProfile = async (req, res) => {
    const { bio, profilePic } = req.body;
    const { userId } = req.user;
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { bio, profilePic },
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  };
  