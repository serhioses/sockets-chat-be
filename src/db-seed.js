import 'dotenv/config';
import { connectDB } from './lib/db.js';
import { User } from './models/user.model.js';
import { genSalt, hashPassword } from './lib/utils/password-hasher.js';

const seedUsers = [
    {
      email: 'violet.reed@example.com',
      fullName: 'Violet Reed',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/16.jpg',
      salt: genSalt(),
    },
    {
      email: 'carter.bailey@example.com',
      fullName: 'Carter Bailey',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      salt: genSalt(),
    },
    {
      email: 'owen.cooper@example.com',
      fullName: 'Owen Cooper',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
      salt: genSalt(),
    },
    {
      email: 'zoe.hall@example.com',
      fullName: 'Zoe Hall',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
      salt: genSalt(),
    },
    {
      email: 'ellie.ward@example.com',
      fullName: 'Ellie Ward',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
      salt: genSalt(),
    },
    {
      email: 'nora.wood@example.com',
      fullName: 'Nora Wood',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
      salt: genSalt(),
    },
    {
      email: 'jackson.kelly@example.com',
      fullName: 'Jackson Kelly',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
      salt: genSalt(),
    },
    {
      email: 'logan.brooks@example.com',
      fullName: 'Logan Brooks',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
      salt: genSalt(),
    },
    {
      email: 'julian.hayes@example.com',
      fullName: 'Julian Hayes',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
      salt: genSalt(),
    },
    {
      email: 'hazel.bennett@example.com',
      fullName: 'Hazel Bennett',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/13.jpg',
      salt: genSalt(),
    },
    {
      email: 'natalie.sanders@example.com',
      fullName: 'Natalie Sanders',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
      salt: genSalt(),
    },
    {
      email: 'lily.hughes@example.com',
      fullName: 'Lily Hughes',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      salt: genSalt(),
    },
    {
      email: 'grace.morris@example.com',
      fullName: 'Grace Morris',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
      salt: genSalt(),
    },
    {
      email: 'ezra.price@example.com',
      fullName: 'Ezra Price',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/men/16.jpg',
      salt: genSalt(),
    },
    {
      email: 'levi.richardson@example.com',
      fullName: 'Levi Richardson',
      password: '123456',
      avatar: 'https://randomuser.me/api/portraits/men/14.jpg',
      salt: genSalt(),
    },
];    

const seedDB = async () => {
  try {
    await connectDB();

    const promises = seedUsers.map((user) => hashPassword(user.password, user.salt));
    const passwords = await Promise.all(promises);
    const usersToInsert = seedUsers.map((user, index) => {
        return {
            ...user,
            password: passwords[index],
        };
    });

    await User.insertMany(usersToInsert);
    console.log('DB seeded successfully');
  } catch (error) {
    console.error('Error seeding DB:', error);
  }
};

seedDB();
