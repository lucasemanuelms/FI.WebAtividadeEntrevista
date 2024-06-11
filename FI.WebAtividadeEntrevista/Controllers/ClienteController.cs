using FI.AtividadeEntrevista.BLL;
using WebAtividadeEntrevista.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.DML;

namespace WebAtividadeEntrevista.Controllers
{
    public class ClienteController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Incluir()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Incluir(ClienteModel model)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBenef = new BoBeneficiario();
            
            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
            else
            {

                if (!bo.VerificarExistencia(model.CPF))
                {
                    model.Id = bo.Incluir(new Cliente()
                    {
                        CEP = model.CEP,
                        Cidade = model.Cidade,
                        Email = model.Email,
                        Estado = model.Estado,
                        Logradouro = model.Logradouro,
                        Nacionalidade = model.Nacionalidade,
                        Nome = model.Nome,
                        Sobrenome = model.Sobrenome,
                        Telefone = model.Telefone,
                        CPF = model.CPF
                    });

                    if(model.Beneficiarios != null)
                    {
                        foreach (BeneficiarioModel beneficiario in model.Beneficiarios)
                        {
                            if (!boBenef.VerificarExistencia(beneficiario.CPF))
                            {
                                boBenef.Incluir(new Beneficiario()
                                {
                                    CPF = beneficiario.CPF,
                                    Nome = beneficiario.Nome,
                                    ClienteId = model.Id
                                });
                            }
                            else
                            {
                                return Json($"O beneficiário já se encontra cadastrado!");
                            }
                        }
                    }

                    return Json("Cadastro efetuado com sucesso");
                }
                else
                {
                    return Json("O CPF informado já está cadastrado!");
                }
                
            }
        }

        [HttpPost]
        public JsonResult Alterar(ClienteModel model)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBenef = new BoBeneficiario();

            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
            else
            {
                bo.Alterar(new Cliente()
                {
                    Id = model.Id,
                    CEP = model.CEP,
                    Cidade = model.Cidade,
                    Email = model.Email,
                    Estado = model.Estado,
                    Logradouro = model.Logradouro,
                    Nacionalidade = model.Nacionalidade,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    Telefone = model.Telefone,
                    CPF = model.CPF
                });

                if (model.Beneficiarios != null)
                {
                    foreach (BeneficiarioModel beneficiario in model.Beneficiarios)
                    {
                        if (beneficiario.Oper == 0)
                        {
                            boBenef.Excluir(beneficiario.Id);
                        }
                        else if (beneficiario.Oper == 1)
                        {
                            boBenef.Alterar(new Beneficiario()
                            {
                                Id = beneficiario.Id,
                                CPF = beneficiario.CPF,
                                Nome = beneficiario.Nome,
                                ClienteId = model.Id
                            });
                        }
                        else if (beneficiario.Oper == 2)
                        {
                            boBenef.Incluir(new Beneficiario()
                            {
                                CPF = beneficiario.CPF,
                                Nome = beneficiario.Nome,
                                ClienteId = model.Id
                            });
                        }
                    }
                }
                              
                return Json("Cadastro alterado com sucesso");
            }
        }

        [HttpGet]
        public ActionResult Alterar(long id)
        {
            BoCliente bo = new BoCliente();
            Cliente cliente = bo.Consultar(id);
            Models.ClienteModel model = null;

            List<BeneficiarioModel> beneficiarios = new List<BeneficiarioModel>();

            if (cliente.Beneficiarios != null)
            {
                foreach (Beneficiario beneficiario in cliente.Beneficiarios)
                {
                    beneficiarios.Add(new BeneficiarioModel
                    {
                        Id = beneficiario.Id,
                        ClienteId = beneficiario.ClienteId,
                        CPF = beneficiario.CPF,
                        Nome = beneficiario.Nome
                    });
                }
            }

            if (cliente != null)
            {
                model = new ClienteModel()
                {
                    Id = cliente.Id,
                    CEP = cliente.CEP,
                    Cidade = cliente.Cidade,
                    Email = cliente.Email,
                    Estado = cliente.Estado,
                    Logradouro = cliente.Logradouro,
                    Nacionalidade = cliente.Nacionalidade,
                    Nome = cliente.Nome,
                    Sobrenome = cliente.Sobrenome,
                    Telefone = cliente.Telefone,
                    CPF = cliente.CPF,
                    Beneficiarios = beneficiarios
                };

            
            }

            return View(model);
        }

        [HttpPost]
        public JsonResult ClienteList(int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null)
        {
            try
            {
                int qtd = 0;
                string campo = string.Empty;
                string crescente = string.Empty;
                string[] array = jtSorting.Split(' ');

                if (array.Length > 0)
                    campo = array[0];

                if (array.Length > 1)
                    crescente = array[1];

                List<Cliente> clientes = new BoCliente().Pesquisa(jtStartIndex, jtPageSize, campo, crescente.Equals("ASC", StringComparison.InvariantCultureIgnoreCase), out qtd);

                //Return result to jTable
                return Json(new { Result = "OK", Records = clientes, TotalRecordCount = qtd });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
    }
}