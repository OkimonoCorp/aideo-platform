<?php

namespace App\Repository;

use App\Entity\AchatAvantage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AchatAvantage>
 *
 * @method AchatAvantage|null find($id, $lockMode = null, $lockVersion = null)
 * @method AchatAvantage|null findOneBy(array $criteria, array $orderBy = null)
 * @method AchatAvantage[]    findAll()
 * @method AchatAvantage[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AchatAvantageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AchatAvantage::class);
    }

    public function save(AchatAvantage $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(AchatAvantage $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}