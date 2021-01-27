using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AspNetCoreAngularApp.Models;

namespace AspNetCoreAngularApp.Data
{
    public class EmployeesContext : DbContext
    {
        public EmployeesContext (DbContextOptions<EmployeesContext> options)
            : base(options)
        {
        }

        public DbSet<AspNetCoreAngularApp.Models.Employee> Employee { get; set; }
    }
}
