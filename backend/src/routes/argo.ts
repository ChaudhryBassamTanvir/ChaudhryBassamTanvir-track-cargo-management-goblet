router.get('/', handle(async (req, res) => {
  const { status, search, page = '1', limit = '20', truckId } = req.query as Record<string, string>;
  const filter: Record<string, any> = {};
  if (status) filter.status = status;
  if (truckId) filter.truck = truckId;
  if (search) filter.$or = [
    { trackingId: { $regex: search, $options: 'i' } },
    { origin: { $regex: search, $options: 'i' } },
    { destination: { $regex: search, $options: 'i' } }
  ];
  const [data, total] = await Promise.all([
    Cargo.find(filter).populate('truck').skip((+page - 1) * +limit).limit(+limit).sort({ createdAt: -1 }),
    Cargo.countDocuments(filter)
  ]);
  res.json({ data, total, page: +page, pages: Math.ceil(total / +limit) });
}));